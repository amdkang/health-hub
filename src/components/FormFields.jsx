import TextField from '@mui/material/TextField';
 
/**
 * Renders & exports custom-styled text fields used on all forms  
 */

// basic single-line text field
export const FormTextField = ({ ...props }) => (
  <TextField
    type="text" 
    variant="outlined"
    size="small"
    color="secondary"
    { ...props } 
  />
);

// multi-line text field
export const FormNotesField = ({ formik, maxLength }) => (
  <FormTextField 
    id="notes" 
    label="Notes"
    multiline
    rows={5}
    inputProps={{ maxLength: maxLength ?? 300 }}
    size="large"
    onChange={formik.handleChange}
    value={formik.values.notes}
    { ...formik.getFieldProps("notes") }
  />  
);