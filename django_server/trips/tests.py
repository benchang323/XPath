from django.test import TestCase
from unittest.mock import patch, Mock
import trips.utils
import requests

class TripsUtilsTestCase(TestCase):

    @patch('trips.utils.requests.get')
    def test_get_commute_info_successful(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "routes": [{
                "legs": [{
                    "steps": [{
                        "travel_mode": "TRANSIT",
                        "transit_details": {
                            "line": {"name": "Line A"},
                            "departure_stop": {"name": "Stop 1"},
                            "arrival_stop": {"name": "Stop 2"},
                            "num_stops": 5
                        }
                    }]
                }]
            }]
        }
        mock_get.return_value = mock_response

        with patch('trips.utils.scrape_transit_info', return_value=['Stop 1', 'Stop 2']) as mock_scrape:
            result = trips.utils.get_commute_info('Origin', 'Destination',None,None)
            self.assertIn('segments', result)
            self.assertEqual(len(result['segments']), 1)
            self.assertEqual(result['segments'][0]['line_name'], 'Line A')
            self.assertEqual(result['transit_stops'], 'Stop 1')
            mock_scrape.assert_called_once_with('Origin', 'Destination',None)

    @patch('trips.utils.webdriver.Chrome')
    def test_scrape_transit_info_successful(self, mock_driver):
        # Mock WebDriver methods and behavior
        mock_driver_instance = mock_driver.return_value
        mock_driver_instance.find_elements.return_value = [
            Mock(get_attribute=Mock(side_effect=lambda x: 'group_0' if x == 'data-groupindex' else 'hideable_0')),
            Mock(get_attribute=Mock(side_effect=lambda x: 'group_1' if x == 'data-groupindex' else 'hideable_1'))
        ]
        mock_driver_instance.page_source = '<html></html>'

        # Mock WebDriverWait and BeautifulSoup.select for the transit stops
        mock_wait = Mock()
        mock_wait.until.return_value = Mock(click=Mock())
        
        with patch('trips.utils.WebDriverWait', return_value=mock_wait):
            with patch('trips.utils.BeautifulSoup', autospec=True) as mock_soup:
                mock_soup_instance = mock_soup.return_value
                mock_stop_a = Mock()
                mock_stop_b = Mock()
                mock_stop_a.select_one.side_effect = lambda selector: Mock(text='Stop A') if selector == '.qjQGPd' else Mock(text='08:00 AM')
                mock_stop_b.select_one.side_effect = lambda selector: Mock(text='Stop B') if selector == '.qjQGPd' else Mock(text='09:00 AM')

                mock_soup_instance.select.return_value = [mock_stop_a, mock_stop_b]

                # Call the function and validate
                stops, stop_times = trips.utils.scrape_transit_info('Origin', 'Destination', 0)
                self.assertEqual(stops, ['Stop A', 'Stop B'])
                self.assertEqual(stop_times, [['08:00 AM', 'Stop A'], ['09:00 AM', 'Stop B']])

    @patch('trips.utils.generate_directions_url')
    def test_generate_directions_url(self, mock_generate):
        mock_generate.return_value = 'https://www.google.com/maps/dir/?api=1&origin=Origin&destination=Destination&travelmode=transit'
        url = trips.utils.generate_directions_url('Origin', 'Destination')
        self.assertEqual(url, 'https://www.google.com/maps/dir/?api=1&origin=Origin&destination=Destination&travelmode=transit')

    def test_get_commute_route_plane_mode(self):
        route = trips.utils.get_commute_route('Origin', 'Destination', 'plane')
        self.assertEqual(route, ['Plane - No Route'])

    @patch('trips.utils.requests.get')
    def test_get_commute_info_request_failed(self, mock_get):
        mock_get.side_effect = requests.exceptions.RequestException
        with self.assertRaises(requests.exceptions.RequestException):
            trips.utils.get_commute_info('Origin', 'Destination',None,None)

    @patch('trips.utils.requests.get')
    def test_get_commute_info_bad_response(self, mock_get):
        mock_response = Mock(status_code=404)
        mock_get.return_value = mock_response
        result = trips.utils.get_commute_info('Origin', 'Destination',None,None)
        self.assertIsNotNone(result.get('segments'))

    @patch('trips.utils.webdriver.Chrome')
    def test_scrape_transit_info_exception_handling(self, mock_driver):
        mock_driver.side_effect = Exception('Webdriver error')
        stops = trips.utils.scrape_transit_info('Origin', 'Destination',None)
        self.assertEqual(stops, ([],[]))  

    def test_generate_directions_url_with_special_characters(self):
        origin = "New York, NY"
        destination = "Los Angeles, CA"
        expected_url_part = "api=1&origin=New%20York%2C%20NY&destination=Los%20Angeles%2C%20CA&travelmode=transit"
        url = trips.utils.generate_directions_url(origin, destination)
        self.assertIn(expected_url_part, url)

    @patch('trips.utils.requests.get')
    def test_get_commute_info_no_routes_found(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"routes": []}
        mock_get.return_value = mock_response

        result = trips.utils.get_commute_info('Origin', 'Destination',None,None)
        self.assertEqual(len(result['segments']), 0)

    @patch('trips.utils.requests.get')
    def test_get_commute_info_invalid_json_response(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"invalid": "data","routes": []}
        mock_get.return_value = mock_response

        result = trips.utils.get_commute_info('Origin', 'Destination',None,None)
        self.assertEqual(len(result['segments']), 0)

    @patch('trips.utils.requests.get')
    def test_get_commute_route_non_transit_mode(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "routes": [{
                "legs": [{
                    "steps": [{
                        "travel_mode": "WALKING",
                        "start_location": {"lat": 40.7128, "lng": -74.0060},
                        "end_location": {"lat": 34.0522, "lng": -118.2437},
                        "polyline": {"points": "abcd"},
                        "duration": {"value": 3600, "text": "1 hour"},
                        "html_instructions": "Walk to Los Angeles"
                    }]
                }]
            }]
        }
        mock_get.return_value = mock_response

        result = trips.utils.get_commute_route('New York', 'Los Angeles', 'walking')
        self.assertIn('segments', result)
        self.assertEqual(len(result['segments']), 0)  

    @patch('trips.utils.requests.get')
    def test_get_commute_info_with_unexpected_travel_mode(self, mock_get):

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "routes": [{
                "legs": [{
                    "steps": [{
                        "travel_mode": "UNICYCLE",  
                    }]
                }]
            }]
        }
        mock_get.return_value = mock_response

        result = trips.utils.get_commute_info('Origin', 'Destination', 'transit',None)
        self.assertEqual(len(result['segments']), 0)  

    @patch('trips.utils.requests.get')
    def test_get_commute_info_api_key_error(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 403  
        mock_get.return_value = mock_response

        with self.assertRaises(Exception) as context:
            trips.utils.get_commute_info('Origin', 'Destination')

        print(context.exception)
        self.assertFalse('API key' in str(context.exception))

    def test_scrape_transit_info_no_stops_found(self):
        with patch('trips.utils.webdriver.Chrome') as mock_driver, \
             patch('trips.utils.WebDriverWait'), \
             patch('trips.utils.BeautifulSoup.select', return_value=[]):  
            mock_driver_instance = mock_driver.return_value
            mock_driver_instance.page_source = '<html></html>'

            stops = trips.utils.scrape_transit_info('Origin', 'Destination',None)
            self.assertEqual(stops, ([],[])) 

