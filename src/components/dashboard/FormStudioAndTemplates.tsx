import { CollectionFormBuilder, FormTemplate, PRESET_TEMPLATES, CollectionFormBuilderProps } from './CollectionFormBuilder';

export { PRESET_TEMPLATES };
export type { FormTemplate };

export interface FormStudioAndTemplatesProps extends CollectionFormBuilderProps {}

export const FormStudioAndTemplates: React.FC<FormStudioAndTemplatesProps> = (props) => {
  return <CollectionFormBuilder {...props} />;
};

export default FormStudioAndTemplates;
