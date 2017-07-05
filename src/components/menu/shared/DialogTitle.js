import React, {PropTypes} from 'react';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/content/clear';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';

const CodeBlockTitle = (props) => (
  <Toolbar>
    <ToolbarGroup>
      <ToolbarTitle text={props.title || 'Example'} />
    </ToolbarGroup>
    <ToolbarGroup>
      <IconButton touch={true}>
        <CloseIcon />
      </IconButton>
    </ToolbarGroup>
  </Toolbar>
);

CodeBlockTitle.propTypes = {
  title: PropTypes.string,
  tooltip: PropTypes.string,
};

export default CodeBlockTitle;
