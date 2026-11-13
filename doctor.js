export default {
  customRulesOnly: true,
  rules: {
    // The react-effects rules report the same patterns.
    'react-doctor/no-effect-event-handler': 'off',
    'react-doctor/no-fetch-in-effect': 'off',
    'react-doctor/no-prop-callback-in-effect': 'off',
    'react-doctor/no-set-state-after-await-in-effect': 'off',
    'react-doctor/prefer-use-sync-external-store': 'off',

    // react/set-state-in-effect reports the same patterns.
    'react-doctor/no-derived-state-effect': 'off',
    'react-doctor/no-effect-chain': 'off',
    'react-doctor/no-mirror-prop-effect': 'off',
  },
}
