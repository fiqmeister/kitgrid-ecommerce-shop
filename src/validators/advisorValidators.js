// checks what the customer types into the Kit Advisor panel

const yup = require('yup');

const advisorSchema = yup.object({
    // the customer's message, e.g. "U12 team of 16 players, S$800 budget"
    message: yup.string()
        .trim()
        .required('Type a message first.')
        .max(500, 'Please keep your message under 500 characters.'),
    // which tab is open: "For my team" or "For me"
    mode: yup.string()
        .oneOf(['team', 'personal'], 'mode must be team or personal')
        .required('mode is required'),
});

module.exports = { advisorSchema };
