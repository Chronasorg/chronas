import React from 'react';
import Chip from 'material-ui/Chip';
import PropTypes from 'prop-types';

const styles = {
    main: { display: 'flex', flexWrap: 'wrap' },
    chip: { margin: 4 },
};

const ArrayField = ({ source, record }) => (
    <span style={styles.main}>
        {record[source].map(field => (
            <Chip key={field} style={styles.chip}>{field}
            </Chip>
        ))}
    </span>
);

ArrayField.propTypes = {
  label: PropTypes.string,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
};


export default ArrayField;
