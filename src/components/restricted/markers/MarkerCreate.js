{/*import React from 'react';*/}
{/*import PropTypes from 'prop-types';*/}
{/*import { connect } from 'react-redux';*/}
{/*import MuiAppBar from 'material-ui/AppBar';*/}
{/*import muiThemeable from 'material-ui/styles/muiThemeable';*/}
{/*import compose from 'recompose/compose';*/}
{/*import { toggleSidebar as toggleSidebarAction } from '../../actions';*/}

{/*const MarkerCreate = ({ title, toggleSidebar }) => (*/}
  {/*<MuiAppBar title={title} onLeftIconButtonTouchTap={toggleSidebar} />*/}
{/*);*/}

{/*AppBar.propTypes = {*/}
  {/*title: PropTypes.oneOfType([PropTypes.string, PropTypes.element])*/}
    {/*.isRequired,*/}
  {/*toggleSidebar: PropTypes.func.isRequired,*/}
{/*};*/}

{/*const enhance = compose(*/}
  {/*muiThemeable(), // force redraw on theme change*/}
  {/*connect(null, {*/}
    {/*toggleSidebar: toggleSidebarAction,*/}
  {/*})*/}
{/*);*/}

{/*export default enhance(MarkerCreate);*/}

{/*export const MarkerCreate = (props) => {*/}
  {/*console.debug(props.modActive.data[0])*/}
  {/*const tata = props.modActive.data[0]*/}
  {/*return <Create {...props}>*/}
    {/*<SimpleForm redirect="list">*/}
      {/*<TextInput source="name" label="resources.markers.fields.name" />*/}
      {/*<TextInput source="wiki" label="resources.markers.fields.url" validate={required} />*/}
      {/*<ModButton modType="marker" />*/}
      {/*<ModGeoInput*/}
        {/*modActive={tata} setModData={props.setModData} accessor={1} source="geo[1]"  label="resources.markers.fields.lng" />*/}
      {/*<ModGeoInput accessor={0} source="geo[0]"  label="resources.markers.fields.lat" />*/}
      {/*<NumberInput input={{ value: {tata}, onChange: (eventOrValue,t,tt) => { console.debug(eventOrValue,t,tt) } }} source="geo[0]" label="resources.markers.fields.lat" />*/}
      {/*/!*<NumberInput source="geo[1]"  onChange={(eventOrValue, t,tt) => { console.debug(eventOrValue,t,tt) }} label="resources.markers.fields.lng" />*!/*/}
      {/*<TextInput source="type" validate={required} label="resources.markers.fields.type" />*/}
      {/*<TextInput source="subtype" label="resources.markers.fields.subtype" />*/}
      {/*<DateInput source="lastUpdated" label="resources.markers.fields.lastUpdated" type="date" />*/}
      {/*<NumberInput source="startYear" label="resources.markers.fields.startYear" type="date" />*/}
      {/*<NumberInput source="endYear" label="resources.markers.fields.endYear" />*/}
      {/*<DateInput source="date" label="resources.markers.fields.date" type="date" />*/}
      {/*<NumberInput source="rating" label="resources.markers.fields.rating" style={{ width: '5em', color: chronasMainColor }} />*/}
    {/*</SimpleForm>*/}
  {/*</Create>*/}
{/*};*/}
