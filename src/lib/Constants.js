exports.STRIP = /(_|\*|`|~)+/g;

/*
exports.DEFAULTS.QUERYBUILDER = {
    datatypes: {
        any: { type: 'TEXT' },
        boolean: { type: 'BOOLEAN', resolver: value => value },
        categorychannel: { type: 'VARCHAR(18)' },
        channel: { type: 'VARCHAR(18)' },
        command: { type: 'TEXT' },
        float: { type: 'FLOAT', resolver: value => value },
        guild: { type: 'VARCHAR(18)' },
        integer: { type: 'INTEGER', resolver: value => value },
        json: { type: 'JSON', resolver: (value) => `'${JSON.stringify(value).replace(/'/g, "''")}'` },
        language: { type: 'VARCHAR(5)' },
        role: { type: 'VARCHAR(18)' },
        string: { type: ({ max }) => max ? `VARCHAR(${max})` : 'TEXT' },
        textchannel: { type: 'VARCHAR(18)' },
        url: { type: 'TEXT' },
        user: { type: 'VARCHAR(18)' },
        voicechannel: { type: 'VARCHAR(18)' }
    },
    queryBuilderOptions: {
        array: () => 'TEXT',
        resolver: (value) => `'${String(value).replace(/'/g, "''")}'`,
        arrayResolver: (values) => `'${JSON.stringify(values)}'`,
        formatDatatype: (name, datatype, def = null) => `${name} ${datatype}${def !== null ? ` NOT NULL DEFAULT ${def}` : ''}`
    }
};*/
