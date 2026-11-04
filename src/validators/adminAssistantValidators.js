// checks the question typed into the dashboard's admin assistant

const yup = require('yup');

// the form has one field: message
const assistantQuestionSchema = yup.object({
    message: yup.string()
        .trim()
        .required('Type a question first.')
        .max(300, 'Please keep your question under 300 characters.'),
});

module.exports = { assistantQuestionSchema };
