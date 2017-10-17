import React from 'react';
import { FunctionField } from 'admin-on-rest';

const render = record => record.basket.length;

const NbItemsField = (props) => <FunctionField {...props} render={render} />;

NbItemsField.defaultProps = {
    label: 'Nb Items',
    style: { textAlign: 'right' },
    headerStyle: { textAlign: 'right' },
};

export default NbItemsField;
