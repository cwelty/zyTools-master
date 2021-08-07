## Python Tutor tool

The Python Tutor tool accepts one option, `trace`, that is the output of the Python Tutor's 
trace of the Python program.

```javascript
options = {
  'trace' : { ... }
}
```

* Default option:
        this.trace = { 'trace' : {"code": "x = 5\nprint x", "trace": [{"ordered_globals": [],
                        "stdout": "", "func_name": "<module>", "stack_to_render": [], "globals": {},
                        "heap": {}, "line": 1, "event": "step_line"}, {"ordered_globals": ["x"], "stdout": "",
                        "func_name": "<module>", "stack_to_render": [], "globals": {"x": 5}, "heap": {}, "line": 2,
                        "event": "step_line"}, {"ordered_globals": ["x"], "stdout": "5\n", "func_name": "<module>",
                        "stack_to_render": [], "globals": {"x": 5}, "heap": {}, "line": 2, "event": "return"}]} };
                        
        if (options && options['trace']) {
            this.trace = options['trace'];
        }
        
Option is not needed.