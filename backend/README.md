## Flask Server for interaktive.js

### Overview

This project provides a Flask server designed to facilitate the
creation of interactive HTML presentations. The front end
interactiv.js leverages tools like Quarto and Reveal.js, enhanced with
special HTML `div` tags bound to interactive.js snippets. This server
collects inputs from all participants and communicate with the server.



### Installation

To install the package, use pip:

```sh
pip install interactiv-server
```

### Usage

Here's a basic example of how to use this Flask server add-on to
generate an interactive HTML presentation:

1. **Setup environment and install requirements**:
    ```bash
	make .venv
    ```

2. **Create a Quarto file**: Use Quarto to create a `.qmd` file with
   your presentation content, enhanced with interactive elements. Have
   a look into interaktiv.js for an example.

3. **Run your Flask app**:
    ```sh
    make run
    ```

Navigate to `http://localhost:5050` to view and interact with your
presentation.


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


