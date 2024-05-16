## Interaktiv.js

### Overview

This project provides frontend and backend code to allow the creation
of interactive HTML presentations. The front end enhances Quarto
markdown code with special HTML `div` tags bound to interactive.js
snippets at runtime. This server collects inputs from all participants and
communicate with the server.



### Installation

To setup the front end:

```bash
make init
make install
make render
```
now you should have docs directory, which is served by the backend.

To setup the backend

```bash
cd backend
make .venv
```

### Render your enhanced Quarto presentation

As usual you render your quarto presentation with `quarto rende <your file.qmd>` our you can use

```sh
make render
```

Have a look into index.qmd for an quarto presentation, enhanced with interaktive elements.

```markdown
## Collect input

What additional feature do you need:

<div type="inputField" id="inputField1"></div>
<div type="inputCollection" ref="inputField1" argConfig='{ "width": 500, "height": 300, "hidden": false }'></div>

## Collect polls

I like Quarto interaktiv:

<div type="pollField" id="pollField1"></div>
<div type="pollPercentage" ref="pollField1" class="centered-xxl-text"></div>
```

### Usage

To start the server which will serve the presentation, holds
participants nicknames and collect the interaktive inputs.


**Run your Flask app**:
```bash
cd backend
make run
```

Navigate to `http://<local IP>:5050` to view and interact with your
presentation. As your participants to do the same.


### Contributions

Contributions are welcome! If you encounter any issues or have feature
requests, please open an issue on the [GitHub
repository](https://github.com/WolfgangSpahn/interaktiv.git).




### License

This project is licensed under the MIT License. See the
[LICENSE](https://github.com/WolfgangSpahn/interaktiv.git/blob/main/LICENSE)
file for details.

### Contact

For any inquiries or questions, please contact
[wolfgang.spahn@gmail.com](mailto:wolfgang.spahn@gmail.com).


