{
    language:  'zyPseudocode',
    levels: [
        {
            template:   'integer x\ninteger y\ninteger z\nx = {{combo.x}}\ny = {{combo.y}}\nz = {{combo.z}}\nz = x + y\nPut z to output',
            parameters: {
                combo: [
                    { x: '1', y: '2', z: '3' },
                    { x: '4', y: '5', z: '6' },
                    { x: '7', y: '8', z: '9' },
                    { x: '9', y: '8', z: '7' },
                    { x: '6', y: '5', z: '4' },
                    { x: '3', y: '2', z: '1' }
                ]
            },
            explanation: '{{combo.z}} = {{combo.x}} + {{combo.y}}'
        }
    ]
}
