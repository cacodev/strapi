/**
 *
 * Edit
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  findIndex,
  get,
  has,
  isEmpty,
  isFunction,
  upperFirst,
} from 'lodash';

// You can find these components in either
// ./node_modules/strapi-helper-plugin/lib/src
// or strapi/packages/strapi-helper-plugin/lib/src
import Input from 'components/InputsIndex';

import InputJSONWithErrors from 'components/InputJSONWithErrors';
import WysiwygWithErrors from 'components/WysiwygWithErrors';

import styles from './styles.scss';

const getInputType = (type = '') => {
  switch (type.toLowerCase()) {
    case 'boolean':
      return 'checkbox';
    case 'bigint':
    case 'decimal':
    case 'float':
    case 'integer':
      return 'number';
    case 'date':
    case 'datetime':
      return 'date';
    case 'email':
      return 'email';
    case 'enumeration':
      return 'select';
    case 'password':
      return 'password';
    case 'string':
      return 'text';
    case 'text':
      return 'textarea';
    case 'file':
    case 'files':
      return 'file';
    case 'json':
      return 'json';
    default:
      return 'text';
  }
};

class Edit extends React.PureComponent {
  getInputErrors = (attr) => {
    const index = findIndex(this.props.formErrors, ['name', attr]);
    return index !== -1 ? this.props.formErrors[index].errors : [];
  }

  /**
   * Retrieve the Input layout
   * @param  {String} attr [description]
   * @return {Object}      Object containing the Input's label customBootstrapClass, ...
   */
  getInputLayout = (attr) => {
    const { layout } = this.props;

    return Object.keys(get(layout, ['attributes', attr], {})).reduce((acc, current) => {
      acc[current] = isFunction(layout.attributes[attr][current]) ?
        layout.attributes[attr][current](this) :
        layout.attributes[attr][current];

      return acc;
    }, {});
  };

  /**
   * Retrieve the input's validations
   * @param  {String} attr
   * @return {Object}
   */
  getInputValidations = (attr) => {
    const { formValidations } = this.props;
    const index = findIndex(formValidations, ['name', attr]);

    return get(formValidations, [index, 'validations'], {});
  }

  /**
   * Retrieve all relations made with the upload plugin
   * @param  {Object} props
   * @return {Object}
   */
  getUploadRelations = (props) => (
    Object.keys(get(props.schema, 'relations', {})).reduce((acc, current) => {
      if (get(props.schema, ['relations', current, 'plugin']) === 'upload') {
        acc[current] = {
          description: '',
          label: upperFirst(current),
          type: 'file',
        };
      }

      return acc;
    }, {})
  )

  fileRelationAllowMultipleUpload = (relationName) => has(this.props.schema, ['relations', relationName, 'collection']);

  orderAttributes = () => get(this.props.schema, ['editDisplay', 'fields'], []);

  render(){
    return (
      <div className={styles.form}>
        <div className="row">
          {this.orderAttributes().map((attr, key) => {
            const details = get(this.props.schema, ['editDisplay', 'availableFields', attr]);
            // Retrieve the input's bootstrapClass from the layout
            const layout = this.getInputLayout(attr);
            const appearance = get(layout, 'appearance');
            const type = !isEmpty(appearance) ? appearance.toLowerCase() : get(layout, 'type', getInputType(details.type));
            const inputDescription = get(details, 'description', null);

            return (  
              <Input
                autoFocus={key === 0}
                customBootstrapClass={get(layout, 'className')}
                customInputs={{ json: InputJSONWithErrors, wysiwyg: WysiwygWithErrors }}
                didCheckErrors={this.props.didCheckErrors}
                errors={this.getInputErrors(attr)}
                inputDescription={inputDescription}
                key={attr}
                label={get(layout, 'label') || details.label || ''}
                multiple={this.fileRelationAllowMultipleUpload(attr)}
                name={attr}
                onBlur={this.props.onBlur}
                onChange={this.props.onChange}
                placeholder={get(layout, 'placeholder') || details.placeholder || ''}
                resetProps={this.props.resetProps}
                selectOptions={get(this.props.attributes, [attr, 'enum'])}
                type={type}
                validations={this.getInputValidations(attr)}
                value={this.props.record[attr]}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

Edit.defaultProps = {
  attributes: {},
  formErrors: [],
  formValidations: [],
  layout: {},
  onBlur: () => {},
  onChange: () => {},
  record: {},
  resetProps: false,
  schema: {},
};

Edit.propTypes = {
  attributes: PropTypes.object,
  didCheckErrors: PropTypes.bool.isRequired,
  formErrors: PropTypes.array,
  formValidations: PropTypes.array,
  layout: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  record: PropTypes.object,
  resetProps: PropTypes.bool,
  schema: PropTypes.object,
};

export default Edit;
