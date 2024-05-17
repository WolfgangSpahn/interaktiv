import pytest
import sys

from os.path import dirname, join, abspath

from app.app import app  


# Add the root project folder to the python path, so that the tests can import the app
this_dir = dirname(__file__)
sys.path.insert(0, abspath(join(this_dir, "..")))

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_static_file_serving(client):
    # Assuming you have a static file named 'styles.css' in the 'static/css' directory
    response = client.get('images/icons/animal-bull-domestic-svgrepo-com.svg')
    assert response.status_code == 200
    assert 'image/svg+xml; charset=utf-8' in response.headers['Content-Type']

    # Check the content of the file
    expected_content = '<?xml version="1.0" ?>'
    assert expected_content in response.get_data(as_text=True)

if __name__ == '__main__':
    pytest.main()
