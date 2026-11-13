const docs = 'https://react.dev/learn/you-might-not-need-an-effect'

const effectHooks = new Set(['useEffect', 'useLayoutEffect'])
const stateHooks = new Set(['useState', 'useReducer'])
const derivedHooks = new Set(['useMemo', 'useCallback', 'useId'])
const subscribeMethods = new Set([
  'addEventListener',
  'addListener',
  'on',
  'subscribe',
])

const isFunction = (node) =>
  node?.type === 'ArrowFunctionExpression' ||
  node?.type === 'FunctionExpression' ||
  node?.type === 'FunctionDeclaration'

const hookName = (callee) => {
  if (callee.type === 'Identifier') return callee.name
  if (callee.type === 'MemberExpression' && !callee.computed) {
    return callee.property.name
  }
  return undefined
}

const unwrap = (node) => {
  let current = node
  while (
    current &&
    [
      'ChainExpression',
      'TSAsExpression',
      'TSNonNullExpression',
      'TSSatisfiesExpression',
    ].includes(current.type)
  ) {
    current = current.expression
  }
  return current
}

const rootName = (node) => {
  const current = unwrap(node)
  if (current?.type === 'Identifier') return current.name
  if (current?.type === 'MemberExpression') return rootName(current.object)
  return undefined
}

const children = (node) =>
  Object.entries(node)
    .filter(([key]) => key !== 'parent')
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter((value) => typeof value?.type === 'string')

function walk(node, visit, { intoFunctions }) {
  for (const child of children(node)) {
    visit(child)
    if (intoFunctions || !isFunction(child))
      walk(child, visit, { intoFunctions })
  }
}

function collect(node, type, { intoFunctions }) {
  const found = []
  walk(
    node,
    (child) => {
      if (child.type === type) found.push(child)
    },
    { intoFunctions },
  )
  return found
}

function namesIn(node) {
  const names = new Set()
  if (node.type === 'Identifier') names.add(node.name)
  walk(
    node,
    (child) => {
      if (child.type !== 'Identifier') return
      const { parent } = child
      if (
        parent.type === 'MemberExpression' &&
        parent.property === child &&
        !parent.computed
      ) {
        return
      }
      if (
        parent.type === 'Property' &&
        parent.key === child &&
        !parent.computed
      ) {
        return
      }
      names.add(child.name)
    },
    { intoFunctions: false },
  )
  return names
}

function componentName(fn) {
  if (fn.id) return fn.id.name
  let { parent } = fn
  while (parent?.type === 'CallExpression') parent = parent.parent
  if (
    parent?.type === 'VariableDeclarator' &&
    parent.id.type === 'Identifier'
  ) {
    return parent.id.name
  }
  return undefined
}

const isComponent = (name) => /^[A-Z]/.test(name)
const isHook = (name) => /^use[A-Z]/.test(name)

function patternNames(pattern) {
  if (!pattern) return []
  if (pattern.type === 'Identifier') return [pattern.name]
  if (pattern.type === 'AssignmentPattern') return patternNames(pattern.left)
  if (pattern.type === 'RestElement') return patternNames(pattern.argument)
  if (pattern.type === 'ObjectPattern') {
    return pattern.properties.flatMap((property) =>
      patternNames(property.type === 'RestElement' ? property : property.value),
    )
  }
  if (pattern.type === 'ArrayPattern')
    return pattern.elements.flatMap(patternNames)
  return []
}

function bindingsOf(fn, name) {
  const bindings = new Map()
  const params = isComponent(name) ? fn.params.slice(0, 1) : fn.params
  for (const param of params) {
    if (param.type === 'Identifier') {
      bindings.set(param.name, { kind: 'props' })
    } else {
      for (const prop of patternNames(param))
        bindings.set(prop, { kind: 'prop' })
    }
  }
  if (fn.body.type !== 'BlockStatement') return bindings
  for (const statement of fn.body.body) {
    if (statement.type !== 'VariableDeclaration') continue
    for (const declarator of statement.declarations) {
      const init = unwrap(declarator.init)
      if (init?.type !== 'CallExpression') continue
      const hook = hookName(init.callee)
      if (!hook || !isHook(hook) || derivedHooks.has(hook)) continue
      if (stateHooks.has(hook) && declarator.id.type === 'ArrayPattern') {
        const [value, setter] = declarator.id.elements
        const state = value?.type === 'Identifier' ? value.name : undefined
        if (state) bindings.set(state, { kind: 'state' })
        if (setter?.type === 'Identifier') {
          bindings.set(setter.name, {
            kind: 'setter',
            state: state ?? setter.name,
          })
        }
        continue
      }
      const kind =
        hook === 'useRef' ? 'ref' : hook === 'useContext' ? 'prop' : 'external'
      for (const bound of patternNames(declarator.id)) {
        bindings.set(bound, { kind, hook })
      }
    }
  }
  return bindings
}

function effectsIn(context, node) {
  const hook = hookName(node.callee)
  if (!hook || !effectHooks.has(hook)) return undefined
  const [callback, deps] = node.arguments
  if (!isFunction(callback)) return undefined
  const fn = context.sourceCode
    .getAncestors(node)
    .findLast((ancestor) => isFunction(ancestor))
  if (!fn) return undefined
  const name = componentName(fn)
  if (!name || !(isComponent(name) || isHook(name))) return undefined
  const bindings = bindingsOf(fn, name)
  const kindOf = (identifier) => bindings.get(identifier)?.kind
  const isProp = (expression) => {
    const current = unwrap(expression)
    if (current?.type === 'Identifier') return kindOf(current.name) === 'prop'
    return (
      current?.type === 'MemberExpression' &&
      kindOf(rootName(current.object)) === 'props'
    )
  }
  const statements =
    callback.body.type === 'BlockStatement' ? callback.body.body : []
  const returnsCleanup =
    callback.body.type !== 'BlockStatement' ||
    collect(callback.body, 'ReturnStatement', { intoFunctions: false }).some(
      (statement) => statement.argument,
    )
  return {
    callback,
    deps: deps?.type === 'ArrayExpression' ? deps.elements : undefined,
    statements,
    returnsCleanup,
    bindings,
    kindOf,
    isProp,
  }
}

function callsSetter(effect, fn) {
  return collect(fn, 'CallExpression', { intoFunctions: true }).find(
    (call) => effect.kindOf(rootName(call.callee)) === 'setter',
  )
}

const text = (context, node) => context.sourceCode.getText(node)

const rule = (description, messages, check) => ({
  meta: {
    type: 'problem',
    docs: { description, url: docs },
    messages,
  },
  create(context) {
    return {
      CallExpression(node) {
        const effect = effectsIn(context, node)
        if (effect) check(context, effect, node)
      },
    }
  },
})

const noEventHandler = rule(
  'Disallow effects that run event logic when state or props change',
  {
    state:
      'This effect calls "{{call}}" when "{{name}}" changes, which turns "{{name}}" into an event. Call "{{call}}" in the event handler that sets "{{name}}". See ' +
      `${docs}#sharing-logic-between-event-handlers`,
    prop:
      'This effect calls "{{call}}" when the prop "{{name}}" changes. Call "{{call}}" in the event handler that changes "{{name}}", in the parent. See ' +
      `${docs}#sharing-logic-between-event-handlers`,
  },
  (context, effect) => {
    if (effect.returnsCleanup) return
    for (const statement of effect.statements) {
      if (statement.type !== 'IfStatement') continue
      const tested = [...namesIn(statement.test)].filter((name) =>
        ['state', 'prop'].includes(effect.kindOf(name)),
      )
      if (tested.length === 0) continue
      for (const call of collect(statement.consequent, 'CallExpression', {
        intoFunctions: false,
      })) {
        const kind = effect.kindOf(rootName(call.callee))
        if (['setter', 'ref', 'prop', 'props'].includes(kind)) continue
        const passed = tested.find((name) =>
          call.arguments.some((argument) => namesIn(argument).has(name)),
        )
        if (!passed) continue
        context.report({
          node: call,
          messageId: effect.kindOf(passed),
          data: { call: text(context, call.callee), name: passed },
        })
      }
    }
  },
)

const noNotifyParent = rule(
  'Disallow effects that pass state or hook data up to the parent',
  {
    state:
      'This effect sends "{{name}}" to the parent through "{{callback}}" after the render. Lift "{{name}}" into the parent, or call "{{callback}}" in the event handler that changes "{{name}}". See ' +
      `${docs}#notifying-parent-components-about-state-changes`,
    external:
      'This effect passes "{{name}}" from "{{hook}}" up through "{{callback}}". Call "{{hook}}" in the parent and pass the result down as a prop. See ' +
      `${docs}#passing-data-to-the-parent`,
  },
  (context, effect) => {
    for (const statement of effect.statements) {
      if (isFunction(statement)) continue
      for (const call of collect(statement, 'CallExpression', {
        intoFunctions: false,
      })) {
        if (!effect.isProp(call.callee)) continue
        const name = call.arguments
          .flatMap((argument) => [...namesIn(argument)])
          .find((candidate) =>
            ['state', 'external'].includes(effect.kindOf(candidate)),
          )
        if (!name) continue
        context.report({
          node: call,
          messageId: effect.kindOf(name),
          data: {
            name,
            callback: text(context, call.callee),
            hook: effect.bindings.get(name)?.hook,
          },
        })
      }
    }
  },
)

const noExternalStore = rule(
  'Disallow effects that mirror an external store into state',
  {
    subscription:
      'This effect copies an external value into "{{state}}" through a subscription. Read it with useSyncExternalStore instead. See ' +
      `${docs}#subscribing-to-an-external-store`,
  },
  (context, effect) => {
    if (!effect.returnsCleanup) return
    const localFunctions = new Map()
    for (const statement of effect.statements) {
      if (statement.type === 'FunctionDeclaration' && statement.id) {
        localFunctions.set(statement.id.name, statement)
      }
      if (statement.type === 'VariableDeclaration') {
        for (const declarator of statement.declarations) {
          if (
            declarator.id.type === 'Identifier' &&
            isFunction(declarator.init)
          ) {
            localFunctions.set(declarator.id.name, declarator.init)
          }
        }
      }
    }
    const setterIn = (handler) => {
      if (handler?.type === 'Identifier') {
        if (effect.kindOf(handler.name) === 'setter') return handler
        const local = localFunctions.get(handler.name)
        return local ? callsSetter(effect, local)?.callee : undefined
      }
      return isFunction(handler)
        ? callsSetter(effect, handler)?.callee
        : undefined
    }
    const calls = effect.statements.flatMap((statement) =>
      statement.type === 'ExpressionStatement' &&
      statement.expression.type === 'CallExpression'
        ? [statement.expression]
        : [],
    )
    const readsNow = calls.some((call) => setterIn(unwrap(call.callee)))
    if (!readsNow) return
    for (const call of calls) {
      const callee = unwrap(call.callee)
      if (
        callee.type !== 'MemberExpression' ||
        callee.computed ||
        !subscribeMethods.has(callee.property.name)
      ) {
        continue
      }
      const setter = call.arguments.map(setterIn).find(Boolean)
      if (!setter) continue
      context.report({
        node: call,
        messageId: 'subscription',
        data: { state: effect.bindings.get(rootName(setter))?.state },
      })
      return
    }
  },
)

const noFetchWithoutCleanup = rule(
  'Disallow effects that set state after an async call without a cleanup',
  {
    race:
      'This effect sets "{{state}}" after an async call and returns no cleanup. If "{{dep}}" changes before the call finishes, the older result can overwrite the newer one. Return a cleanup that ignores stale results. See ' +
      `${docs}#fetching-data`,
  },
  (context, effect, node) => {
    if (effect.returnsCleanup || !effect.deps?.length) return
    const asyncSetter =
      collect(effect.callback.body, 'CallExpression', { intoFunctions: true })
        .filter((call) => {
          const callee = unwrap(call.callee)
          return (
            callee.type === 'MemberExpression' &&
            !callee.computed &&
            callee.property.name === 'then'
          )
        })
        .flatMap((call) => call.arguments)
        .map((handler) =>
          handler.type === 'Identifier' &&
          effect.kindOf(handler.name) === 'setter'
            ? handler
            : isFunction(handler)
              ? callsSetter(effect, handler)?.callee
              : undefined,
        )
        .find(Boolean) ??
      [
        ...collect(effect.callback.body, 'FunctionDeclaration', {
          intoFunctions: true,
        }),
        ...collect(effect.callback.body, 'ArrowFunctionExpression', {
          intoFunctions: true,
        }),
        ...collect(effect.callback.body, 'FunctionExpression', {
          intoFunctions: true,
        }),
      ]
        .filter((fn) => fn.async)
        .map((fn) => callsSetter(effect, fn)?.callee)
        .find(Boolean)
    if (!asyncSetter) return
    const [firstDep] = effect.deps
    context.report({
      node: node.callee,
      messageId: 'race',
      data: {
        state: effect.bindings.get(rootName(asyncSetter))?.state,
        dep: firstDep ? text(context, firstDep) : '',
      },
    })
  },
)

export default {
  meta: { name: 'react-effects' },
  rules: {
    'no-event-handler': noEventHandler,
    'no-external-store': noExternalStore,
    'no-fetch-without-cleanup': noFetchWithoutCleanup,
    'no-notify-parent': noNotifyParent,
  },
}
