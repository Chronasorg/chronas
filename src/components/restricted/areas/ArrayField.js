import React from 'react';
import Chip from 'material-ui/Chip';
;

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


export default ArrayField;
