export default {
  customRulesOnly: true,
  rules: {
    // The react-effects rules report the same code.
    'react-doctor/no-effect-event-handler': 'off',
    'react-doctor/no-event-trigger-state': 'off',
    'react-doctor/no-fetch-in-effect': 'off',
    'react-doctor/no-prop-callback-in-effect': 'off',
    'react-doctor/no-set-state-after-await-in-effect': 'off',

    // react/set-state-in-effect reports the same code.
    'react-doctor/no-derived-state-effect': 'off',
    'react-doctor/no-effect-chain': 'off',
    'react-doctor/no-mirror-prop-effect': 'off',

    // react/no-array-index-key and react/no-unstable-nested-components report
    // the same code.
    'react-doctor/no-array-index-as-key': 'off',
    'react-doctor/no-nested-component-definition': 'off',
  },
}
