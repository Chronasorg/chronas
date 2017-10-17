import React from 'react';
import {
    translate,
    AutocompleteInput,
    BooleanField,
    BooleanInput,
    Datagrid,
    DateField,
    DateInput,
    Edit,
    EditButton,
    Filter,
    List,
    NullableBooleanInput,
    NumberField,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
} from 'admin-on-rest';
import Icon from 'material-ui/svg-icons/editor/attach-money';

import Basket from './Basket';
import NbItemsField from './NbItemsField';
import CustomerReferenceField from '../visitors/CustomerReferenceField';

export const CommandIcon = Icon;

const CommandFilter = (props) => (
    <Filter {...props}>
        <TextInput label="pos.search" source="q" alwaysOn />
        <ReferenceInput source="customer_id" reference="customers">
            <AutocompleteInput optionText={choice => `${choice.first_name} ${choice.last_name}`} />
        </ReferenceInput>
        <SelectInput source="status" choices={[
            { id: 'delivered', name: 'delivered' },
            { id: 'ordered', name: 'ordered' },
            { id: 'cancelled', name: 'cancelled' },
        ]} />
        <DateInput source="date_gte" />
        <DateInput source="date_lte" />
        <TextInput source="total_gte" />
        <NullableBooleanInput source="returned" />
    </Filter>
);

export const CommandList = (props) => (
    <List {...props} filters={<CommandFilter />} sort={{ field: 'date', order: 'DESC' }} perPage={25}>
        <Datagrid >
            <DateField source="date" showTime />
            <TextField source="reference" />
            <CustomerReferenceField />
            <NbItemsField />
            <NumberField source="total" options={{ style: 'currency', currency: 'USD' }} elStyle={{ fontWeight: 'bold' }}/>
            <TextField source="status" />
            <BooleanField source="returned" />
            <EditButton />
        </Datagrid>
    </List>
);

const CommandTitle = translate(({ record, translate }) => <span>{translate('resources.commands.name', { smart_count: 1 })} #{record.reference}</span>);

export const CommandEdit = translate(({ translate, ...rest }) => (
    <Edit title={<CommandTitle />} {...rest}>
        <SimpleForm>
            <Basket />
            <DateInput source="date" />
            <ReferenceInput source="customer_id" reference="customers">
                <AutocompleteInput optionText={choice => `${choice.first_name} ${choice.last_name}`} />
            </ReferenceInput>
            <SelectInput source="status" choices={[
                { id: 'delivered', name: 'delivered' },
                { id: 'ordered', name: 'ordered' },
                { id: 'cancelled', name: 'cancelled' },
            ]}/>
            <BooleanInput source="returned" />
            <div style={{ clear: 'both' }} />
        </SimpleForm>
    </Edit>
));
