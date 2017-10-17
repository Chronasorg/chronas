import React from 'react';
import Chip from 'material-ui/Chip';
import { translate } from 'admin-on-rest';
import segments from '../segments/data';

const styles = {
    main: { display: 'flex', flexWrap: 'wrap' },
    chip: { margin: 4 },
};

const SegmentsField = ({ record, translate }) => (
    <span style={styles.main}>
        {record.groups.map(segment => (
            <Chip key={segment} style={styles.chip}>
                {translate(segments.find(s => s.id === segment).name)}
            </Chip>
        ))}
    </span>
);

const TranslatedSegmentsField = translate(SegmentsField);

TranslatedSegmentsField.defaultProps = {
    addLabel: true,
    source: 'groups',
};

export default TranslatedSegmentsField;
