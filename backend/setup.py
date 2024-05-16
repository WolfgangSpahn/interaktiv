from setuptools import setup, find_packages

# Read contents of README file
from pathlib import Path
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setup(
    name='interaktiv_server',
    version='0.1.0',
    author='Wolfgang Spahn',
    author_email='wolfgang.spahn@gmail.com',
    description='This project provides a Flask server designed to facilitate the creation of interactive HTML presentations.',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/WolfgangSpahn/interaktiv.git',
    packages=find_packages(),
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
    install_requires=[
        'flask',
        'flask-cors',
        'psutil',
    ],
    extras_require={
        'dev': [
            'pytest',
            'flake8',
            'twine',
        ],
    },
    entry_points={
        'console_scripts': [
            'interaktiv_server=interaktiv_server.server:main',
        ],
    },
)
