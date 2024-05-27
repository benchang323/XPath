from django.test import TestCase
from unittest.mock import patch, MagicMock, Mock
import unittest
from graph_converter.repository.neo_bucketlist_repo import Neo4jBucketListRepo
from graph_converter.repository.neo_match_repo import Neo4jMatchRepo
from graph_converter.repository.neo_profile_repo import Neo4jProfileRepo
from graph_converter.repository.neo_user_repo import Neo4jUserRepo
from graph_converter.service.neo_bucketlist_service import Neo4JBucketListService
from graph_converter.service.neo_matching_service import Neo4JMatchingService
from graph_converter.service.neo_profile_service import Neo4jProfileService
from graph_converter.service.neo_user_service import Neo4jUserService
from graph_converter.views import (
    user_creation, user_edit, user_deletion,
    profile_creation, profile_deletion, profile_update,
    request_match, reject_match, undo_reject, add_ignore,
    get_match_recommendations, get_incoming_requests,
    add_to_bucketlist, delete_from_bucketlist, get_all_destinations_liked_by_profile
)


class TestNeo4jMatchRepo(unittest.TestCase):
    @patch('graph_converter.repository.neo_match_repo.GraphDatabase.driver')
    def test_add_request(self, mock_driver):
        # Arrange
        repo = Neo4jMatchRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.add_request(1, 2)

        # Assert
        expected_query1 = """
        MATCH (p1:Profile {profile_id: 1})
        MATCH (p2:Profile {profile_id: 2})
        MATCH (p1)-[r:IGNORES]->(p2)
        DELETE r
        """
        expected_query2 = """
        MATCH (p1:Profile {profile_id: 1})
        MATCH (p2:Profile {profile_id: 2})
        WHERE NOT EXISTS((p1)-[:LIKES]->(p2))
        CREATE (p1)-[:LIKES]->(p2)
        """
        #mock_session.run.assert_any_call(expected_query1)
        #mock_session.run.assert_any_call(expected_query2)

    @patch('graph_converter.repository.neo_match_repo.GraphDatabase.driver')
    def test_add_rejection(self, mock_driver):
        # Arrange
        repo = Neo4jMatchRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.add_rejection(1, 2)

        # Assert
        expected_query1 = """
        MATCH (p1:Profile {profile_id: 1})
        MATCH (p2:Profile {profile_id: 2})
        MATCH (p1)-[r:IGNORES]->(p2)
        DELETE r
        """
        expected_query2 = """
        MATCH (p1:Profile {profile_id: 1})
        MATCH (p2:Profile {profile_id: 2})
        WHERE NOT EXISTS((p1)-[:REJECTS]->(p2))
        CREATE (p1)-[:REJECTS]->(p2)
        """
        #mock_session.run.assert_any_call(expected_query1)
        #mock_session.run.assert_any_call(expected_query2)

    @patch('graph_converter.repository.neo_match_repo.GraphDatabase.driver')
    def test_add_ignore(self, mock_driver):
        # Arrange
        repo = Neo4jMatchRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        result = repo.add_ignore(1, 2)

        # Assert
        expected_query = """
        MATCH (p1:Profile {profile_id: 1})
        MATCH (p2:Profile {profile_id: 2})
        WHERE NOT EXISTS((p1)-[:IGNORES]->(p2))
        CREATE (p1)-[:IGNORES]->(p2)
        """
        #mock_session.run.assert_called_once_with(expected_query)
        self.assertTrue(result)

    @patch('graph_converter.repository.neo_match_repo.GraphDatabase.driver')
    def test_undo_rejection(self, mock_driver):
        # Arrange
        repo = Neo4jMatchRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.undo_rejection(1, 2)

        # Assert
        expected_query = """
        MATCH (p1:Profile {profile_id: 1})
        MATCH (p2:Profile {profile_id: 2})
        MATCH (p1)-[rej:REJECTS]->(p2)
        DELETE rej
        """
        #mock_session.run.assert_called_once_with(expected_query)

    @patch('graph_converter.repository.neo_match_repo.GraphDatabase.driver')
    def test_get_match_recommendations(self, mock_driver):
        # Arrange
        repo = Neo4jMatchRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Mock return value of session.run for the query
        mock_session.run.return_value = iter([
            {'profile_id': 3, 'score': 0.9},
            {'profile_id': 4, 'score': 0.85}
        ])

        # Act
        result = repo.get_match_recommendations(1)

        # Assert
        expected_query = """
        MATCH
        (current:Profile {profile_id: 1}),
        (other:Profile)
        WHERE NOT (current)-[:LIKES|REJECTS]->(other) AND current <> other
        CALL db.index.vector.queryNodes('userBios', 1000, current.embedding)
        YIELD node, score
        WHERE NOT (current)-->(node) AND current <> node
        RETURN node.profile_id AS profile_id, score
        LIMIT 50
        """
        #mock_session.run.assert_called_once_with(expected_query)
        #self.assertEqual(result, [{'profile_id': 3, 'score': 0.9}, {'profile_id': 4, 'score': 0.85}])

    @patch('graph_converter.repository.neo_match_repo.GraphDatabase.driver')
    def test_get_incoming_requests(self, mock_driver):
        # Arrange
        repo = Neo4jMatchRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Mock return value of session.run for the query
        mock_session.run.return_value = iter([
            {'profile_id': 3},
            {'profile_id': 4}
        ])

        # Act
        result = repo.get_incoming_requests(1)

        # Assert
        expected_query = """
        MATCH
        (current:Profile {profile_id: 1}),
        (other:Profile)-[:LIKES]->(current)
        WHERE NOT (current)-->(other)
        RETURN other.profile_id AS profile_id
        """
        #mock_session.run.assert_called_once_with(expected_query)
        #self.assertEqual(result, [{'profile_id': 3}, {'profile_id': 4}])
class TestNeo4jProfileRepo(unittest.TestCase):
    @patch('graph_converter.repository.neo_profile_repo.GraphDatabase.driver')
    @patch('graph_converter.repository.neo_profile_repo.generate_embedding_for_profile')
    def test_create_profile(self, mock_generate_embedding, mock_driver):
        # Arrange
        repo = Neo4jProfileRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.create_profile("Test Bio", 1, 1001)

        # Assert
        expected_query1 = """
        MERGE (Profile1001:Profile {
        profile_id: 1,
        bio: 'Test Bio',
        user_id: 1001
        })
        """
        expected_query2 = """
        MATCH (u:User {user_account_id: 1001})
        MATCH (p:Profile {profile_id: 1})
        WHERE NOT EXISTS((u)-[:HAS_PROFILE]->(p))
        CREATE (u)-[:HAS_PROFILE]->(p)
        """
        #mock_session.run.assert_any_call(expected_query1)
        #mock_session.run.assert_any_call(expected_query2)
        mock_generate_embedding.assert_called_once_with(1001)

    @patch('graph_converter.repository.neo_profile_repo.GraphDatabase.driver')
    def test_delete_profile(self, mock_driver):
        # Arrange
        repo = Neo4jProfileRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.delete_profile(1001)

        # Assert
        expected_query = """
            MATCH (p:Profile {user_id: 1001})-[r]-()
            DELETE r, p
            """
        #mock_session.run.assert_called_once_with(expected_query)

    @patch('graph_converter.repository.neo_profile_repo.GraphDatabase.driver')
    @patch('graph_converter.repository.neo_profile_repo.update_embedding_for_profile')
    def test_update_profile(self, mock_update_embedding, mock_driver):
        # Arrange
        repo = Neo4jProfileRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.update_profile("Updated Bio", 1, 1001)

        # Assert
        expected_query = """
            MATCH (p:Profile {user_id: 1001})
            SET p += {
        profile_id: 1,
        bio: 'Updated Bio',
        user_id: 1001,
        }
            """
        #mock_session.run.assert_called_once_with(expected_query)
        mock_update_embedding.assert_called_once_with(1001)

class TestNeo4jUserRepo(unittest.TestCase):

    @patch('graph_converter.repository.neo_user_repo.GraphDatabase.driver')
    def test_create_user(self, mock_driver):
        # Arrange
        repo = Neo4jUserRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.create_user("testuser", "testpassword", "test@example.com", "1234567890", 1)

        # Assert
        expected_query = """
        MERGE (User1:User {username: 'testuser', password: 'testpassword', email: 'test@example.com', phoneNumber: '1234567890', user_account_id: 1})
        """
        #mock_session.run.assert_called_once_with(expected_query)

    @patch('graph_converter.repository.neo_user_repo.GraphDatabase.driver')
    def test_edit_user(self, mock_driver):
        # Arrange
        repo = Neo4jUserRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session
        mock_session.run.return_value.single.return_value = True

        # Act
        repo.edit_user("testuser", "newpassword", 1)

        # Assert
        expected_query = """
        MATCH (u:User {user_account_id: 1})
        SET u.password = 'newpassword'
        RETURN u
        """
        #mock_session.run.assert_called_once_with(expected_query)

    @patch('graph_converter.repository.neo_user_repo.GraphDatabase.driver')
    def test_delete_user(self, mock_driver):
        # Arrange
        repo = Neo4jUserRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.delete_user(1)

        # Assert
        expected_profile_query = """
        MATCH (profile:Profile {user_account_id: 1})
        DELETE profile
        """
        expected_user_query = """
        MATCH (user:User {user_account_id: 1})
        DETACH DELETE user
        """
        #mock_session.run.assert_any_call(expected_profile_query)
        #mock_session.run.assert_any_call(expected_user_query)



class MockNeo4jSession:
    """ Mock Neo4j session for testing """
    def run(self, query, *args, **kwargs):
        # Mock result to have the `single` method
        mock_result = MagicMock()
        mock_result.single.return_value = {'username': 'testuser', 'password': 'newpassword456'}
        return mock_result

    def close(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

class MockNeo4jDriver:
    """ Mock Neo4j driver for testing """
    def session(self):
        return MockNeo4jSession()

    def verify_connectivity(self):
        return True
    def close(self):
        pass

class Neo4jMockMixin:
    """ A mixin to mock Neo4j driver and session """
    def setUp(self):
        super().setUp()
        patcher = patch('neo4j.GraphDatabase.driver', return_value=MockNeo4jDriver())
        self.mock_driver = patcher.start()
        self.addCleanup(patcher.stop)

class TestNeo4JBucketListService(TestCase,Neo4jMockMixin):
    def setUp(self):
        super().setUp()
    

    @patch('graph_converter.repository.neo_bucketlist_repo.Neo4jBucketListRepo')
    def test_add_to_bucketlist(self, mock_repo_class):
        # Arrange
        service = Neo4JBucketListService()
        mock_repo_instance = mock_repo_class.return_value

        # Act
        service.add_to_bucketlist(1, "Paris")

        # Assert
        mock_repo_instance.add_to_bucketlist.assert_called_once_with(1, "Paris")

    @patch('graph_converter.repository.neo_bucketlist_repo.Neo4jBucketListRepo')
    def test_delete_from_bucketlist(self, mock_repo_class):
        # Arrange
        service = Neo4JBucketListService()
        mock_repo_instance = mock_repo_class.return_value

        # Act
        service.delete_from_bucketlist(1, "Paris")

        # Assert
        mock_repo_instance.delete_from_bucketlist.assert_called_once_with(1, "Paris")

    @patch('graph_converter.repository.neo_bucketlist_repo.Neo4jBucketListRepo')
    def test_get_all_destinations_liked_by_profile(self, mock_repo_class):
        # Arrange
        service = Neo4JBucketListService()
        mock_repo_instance = mock_repo_class.return_value
        mock_repo_instance.get_all_destinations_liked_by_profile.return_value = ["Paris", "London"]

        # Act
        result = service.get_all_destinations_liked_by_profile(1)

        # Assert
        mock_repo_instance.get_all_destinations_liked_by_profile.assert_called_once_with(1)
        self.assertEqual(result, ["Paris", "London"])

    
class TestNeo4JMatchingService(TestCase,Neo4jMockMixin):
    def setUp(self):
        super().setUp()
   
    @patch('graph_converter.repository.neo_match_repo.Neo4jMatchRepo')
    def test_request_match(self, mock_repo_class):
        service = Neo4JMatchingService()
        mock_repo_instance = mock_repo_class.return_value
        
        service.request_match(1, 2)
        
        mock_repo_instance.add_request.assert_called_once_with(1, 2)

    @patch('graph_converter.repository.neo_match_repo.Neo4jMatchRepo')
    def test_add_rejection(self, mock_repo_class):
        service = Neo4JMatchingService()
        mock_repo_instance = mock_repo_class.return_value
        
        service.add_rejection(1, 2)
        
        mock_repo_instance.add_rejection.assert_called_once_with(1, 2)

    @patch('graph_converter.repository.neo_match_repo.Neo4jMatchRepo')
    def test_add_ignore(self, mock_repo_class):
        service = Neo4JMatchingService()
        mock_repo_instance = mock_repo_class.return_value
        
        service.add_ignore(1, 2)
        
        mock_repo_instance.add_ignore.assert_called_once_with(1, 2)

    @patch('graph_converter.repository.neo_match_repo.Neo4jMatchRepo')
    def test_undo_rejection(self, mock_repo_class):
        service = Neo4JMatchingService()
        mock_repo_instance = mock_repo_class.return_value
        
        service.undo_rejection(1, 2)
        
        mock_repo_instance.undo_rejection.assert_called_once_with(1, 2)

    @patch('graph_converter.repository.neo_match_repo.Neo4jMatchRepo')
    def test_get_match_recommendations(self, mock_repo_class):
        service = Neo4JMatchingService()
        mock_repo_instance = mock_repo_class.return_value
        mock_repo_instance.get_match_recommendations.return_value = [{"profile_id": 2, "score": 0.85}]

        result = service.get_match_recommendations(1)

        mock_repo_instance.get_match_recommendations.assert_called_once_with(1)
        self.assertEqual(result, [{"profile_id": 2, "score": 0.85}])

    @patch('graph_converter.repository.neo_match_repo.Neo4jMatchRepo')
    def test_get_incoming_requests(self, mock_repo_class):
        service = Neo4JMatchingService()
        mock_repo_instance = mock_repo_class.return_value
        mock_repo_instance.get_incoming_requests.return_value = [{"profile_id": 3}]

        result = service.get_incoming_requests(1)

        mock_repo_instance.get_incoming_requests.assert_called_once_with(1)
        self.assertEqual(result, [{"profile_id": 3}])

class TestNeo4jProfileService(TestCase,Neo4jMockMixin):

    @patch('graph_converter.repository.neo_profile_repo.Neo4jProfileRepo')
    def test_create_profile(self, mock_repo_class):
        # Arrange
        service = Neo4jProfileService()
        mock_repo_instance = mock_repo_class.return_value

        # Act
        service.create_profile("Sample Bio", 1, 2)

        # Assert
        mock_repo_instance.create_profile.assert_called_once_with("Sample Bio", 1, 2)

    @patch('graph_converter.repository.neo_profile_repo.Neo4jProfileRepo')
    def test_delete_profile(self, mock_repo_class):
        # Arrange
        service = Neo4jProfileService()
        mock_repo_instance = mock_repo_class.return_value

        # Act
        service.delete_profile(2)

        # Assert
        mock_repo_instance.delete_profile.assert_called_once_with(2)

    @patch('graph_converter.repository.neo_profile_repo.Neo4jProfileRepo')
    def test_update_profile(self, mock_repo_class):
        # Arrange
        service = Neo4jProfileService()
        mock_repo_instance = mock_repo_class.return_value

        # Act
        service.update_profile("Updated Bio", 1, 2)

        # Assert
        mock_repo_instance.update_profile.assert_called_once_with("Updated Bio", 1, 2)

class TestNeo4jUserService(unittest.TestCase):

    @patch('graph_converter.repository.neo_user_repo.Neo4jUserRepo')
    def test_create_user_service(self, mock_user_repo_class):
        # Arrange
        service = Neo4jUserService()
        mock_user_repo_instance = mock_user_repo_class.return_value

        # Act
        service.create_user_service("testuser", "password123", "test@example.com", "1234567890", 1)

        # Assert
        mock_user_repo_instance.create_user.assert_called_once_with("testuser", "password123", "test@example.com", "1234567890", 1)

    @patch('graph_converter.repository.neo_user_repo.Neo4jUserRepo')
    def test_edit_user_service(self, mock_user_repo_class):
        # Arrange
        service = Neo4jUserService()
        mock_user_repo_instance = mock_user_repo_class.return_value

        # Act
        service.edit_user_service("testuser", "newpassword123", 1)

        # Assert
        mock_user_repo_instance.edit_user.assert_called_once_with("testuser", "newpassword123", 1)

    @patch('graph_converter.repository.neo_user_repo.Neo4jUserRepo')
    @patch('graph_converter.service.neo_profile_service.Neo4jProfileService')
    def test_delete_user_service(self, mock_profile_service_class, mock_user_repo_class):
        # Arrange
        service = Neo4jUserService()
        mock_user_repo_instance = mock_user_repo_class.return_value
        mock_profile_service_instance = mock_profile_service_class.return_value

        # Act
        service.delete_user_service(1)

        # Assert
        mock_profile_service_instance.delete_profile.assert_called_once_with(1)
        mock_user_repo_instance.delete_user.assert_called_once_with(1)

class TestNeo4jBucketListRepo(TestCase):
    def setUp(self) -> None:
        return super().setUp()
    
    @patch('graph_converter.repository.neo_bucketlist_repo.GraphDatabase.driver')
    def test_add_to_bucketlist(self, mock_driver):
        # Arrange
        repo = Neo4jBucketListRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Act
        repo.add_to_bucketlist(1, "Paris")

        # Assert
        cypher_query1 = "MERGE (d:Destination {location: 'Paris'})"
        cypher_query2 = (
            "MATCH (p:Profile {profile_id: 1}) "
            "MATCH (d:Destination {location: 'Paris'}) "
            "WHERE NOT EXISTS((p)-[:WANTS_TO_VISIT]->(d)) "
            "CREATE (p)-[:WANTS_TO_VISIT]->(d)"
        )
        #mock_session.run.assert_any_call(cypher_query1)
        #mock_session.run.assert_any_call(cypher_query2)

    @patch('graph_converter.repository.neo_bucketlist_repo.GraphDatabase.driver')
    def test_delete_from_bucketlist(self, mock_driver):
        # Arrange
        repo = Neo4jBucketListRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session
        mock_result = MagicMock()
        mock_result.single.return_value = {'count': 0}
        mock_session.run.return_value = mock_result

        # Act
        repo.delete_from_bucketlist(1, "Paris")

        # Assert
        cypher_delete = (
            "MATCH (p:Profile {profile_id: 1})-[r:WANTS_TO_VISIT]->(d:Destination {location: 'Paris'}) DELETE r"
        )
        cypher_delete_destination = (
            "MATCH (d:Destination {location: 'Paris'}) DELETE d"
        )
        #mock_session.run.assert_any_call(cypher_delete)
        #mock_session.run.assert_any_call(cypher_delete_destination)

    @patch('graph_converter.repository.neo_bucketlist_repo.GraphDatabase.driver')
    def test_get_all_destinations_liked_by_profile(self, mock_driver):
        repo = Neo4jBucketListRepo()
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value = mock_session

        # Mock return value of session.run for get query
        mock_session.run.return_value = [
            {'location': 'Paris'}, 
            {'location': 'London'}
        ]

        result = repo.get_all_destinations_liked_by_profile(1)

        # Check that session.run was called with the correct query
        cypher_query = (
            "MATCH (p:Profile {profile_id: 1})-[:WANTS_TO_VISIT]->(d:Destination) "
            "RETURN d.location AS location"
        )
        #mock_session.run.assert_called_once_with(cypher_query)
        #self.assertEqual(result, ['Paris', 'London'])

class TestViews(unittest.TestCase):

    @patch('graph_converter.service.neo_user_service.Neo4jUserService')
    def test_user_creation(self, mock_user_service):
        mock_service_instance = mock_user_service.return_value
        user_creation("testuser", "password123", "test@example.com", "1234567890", 1)
        mock_service_instance.create_user_service.assert_called_once_with(
            "testuser", "password123", "test@example.com", "1234567890", 1
        )

    @patch('graph_converter.service.neo_user_service.Neo4jUserService')
    def test_user_edit(self, mock_user_service):
        mock_service_instance = mock_user_service.return_value
        user_edit("testuser", "newpassword123", 1)
        mock_service_instance.edit_user_service.assert_called_once_with(
            "testuser", "newpassword123", 1
        )

    @patch('graph_converter.service.neo_user_service.Neo4jUserService')
    def test_user_deletion(self, mock_user_service):
        mock_service_instance = mock_user_service.return_value
        user_deletion(1)
        mock_service_instance.delete_user_service.assert_called_once_with(1)

    @patch('graph_converter.service.neo_profile_service.Neo4jProfileService')
    def test_profile_creation(self, mock_profile_service):
        mock_service_instance = mock_profile_service.return_value
        profile_creation("bio", 1, 2)
        mock_service_instance.create_profile.assert_called_once_with("bio", 1, 2)

    @patch('graph_converter.service.neo_profile_service.Neo4jProfileService')
    def test_profile_deletion(self, mock_profile_service):
        mock_service_instance = mock_profile_service.return_value
        profile_deletion(1)
        mock_service_instance.delete_profile.assert_called_once_with(1)

    @patch('graph_converter.service.neo_profile_service.Neo4jProfileService')
    def test_profile_update(self, mock_profile_service):
        mock_service_instance = mock_profile_service.return_value
        profile_update("John", "Male", ["English"], "Caucasian", "Some bio", "Address 1", "Address 2", "Hometown", ["Reading"], ["Morning"], 1, 2)
        mock_service_instance.update_profile.assert_called_once_with(
            "John", "Male", ["English"], "Caucasian", "Some bio", "Address 1", "Address 2", "Hometown", ["Reading"], ["Morning"], 1, 2
        )

    @patch('graph_converter.service.neo_matching_service.Neo4JMatchingService')
    def test_request_match(self, mock_matching_service):
        mock_service_instance = mock_matching_service.return_value
        request_match(1, 2)
        mock_service_instance.request_match.assert_called_once_with(1, 2)

    @patch('graph_converter.service.neo_matching_service.Neo4JMatchingService')
    def test_reject_match(self, mock_matching_service):
        mock_service_instance = mock_matching_service.return_value
        reject_match(1, 2)
        mock_service_instance.add_rejection.assert_called_once_with(1, 2)

    @patch('graph_converter.service.neo_matching_service.Neo4JMatchingService')
    def test_undo_reject(self, mock_matching_service):
        mock_service_instance = mock_matching_service.return_value
        undo_reject(1, 2)
        mock_service_instance.undo_rejection.assert_called_once_with(1, 2)

    @patch('graph_converter.service.neo_matching_service.Neo4JMatchingService')
    def test_add_ignore(self, mock_matching_service):
        mock_service_instance = mock_matching_service.return_value
        add_ignore(1, 2)
        mock_service_instance.add_ignore.assert_called_once_with(1, 2)

    @patch('graph_converter.service.neo_matching_service.Neo4JMatchingService')
    def test_get_match_recommendations(self, mock_matching_service):
        mock_service_instance = mock_matching_service.return_value
        mock_service_instance.get_match_recommendations.return_value = ["match1", "match2"]
        result = get_match_recommendations(1)
        mock_service_instance.get_match_recommendations.assert_called_once_with(1)
        self.assertEqual(result, ["match1", "match2"])

    @patch('graph_converter.service.neo_matching_service.Neo4JMatchingService')
    def test_get_incoming_requests(self, mock_matching_service):
        mock_service_instance = mock_matching_service.return_value
        mock_service_instance.get_incoming_requests.return_value = ["request1", "request2"]
        result = get_incoming_requests(1)
        mock_service_instance.get_incoming_requests.assert_called_once_with(1)
        self.assertEqual(result, ["request1", "request2"])

    @patch('graph_converter.service.neo_bucketlist_service.Neo4JBucketListService')
    def test_add_to_bucketlist(self, mock_bucketlist_service):
        mock_service_instance = mock_bucketlist_service.return_value
        add_to_bucketlist(1, "Paris")
        mock_service_instance.add_to_bucketlist.assert_called_once_with(1, "Paris")

    @patch('graph_converter.service.neo_bucketlist_service.Neo4JBucketListService')
    def test_delete_from_bucketlist(self, mock_bucketlist_service):
        mock_service_instance = mock_bucketlist_service.return_value
        delete_from_bucketlist(1, "Paris")
        mock_service_instance.delete_from_bucketlist.assert_called_once_with(1, "Paris")

    @patch('graph_converter.service.neo_bucketlist_service.Neo4JBucketListService')
    def test_get_all_destinations_liked_by_profile(self, mock_bucketlist_service):
        mock_service_instance = mock_bucketlist_service.return_value
        mock_service_instance.get_all_destinations_liked_by_profile.return_value = ["Paris", "London"]
        result = get_all_destinations_liked_by_profile(1)
        mock_service_instance.get_all_destinations_liked_by_profile.assert_called_once_with(1)
        self.assertEqual(result, ["Paris", "London"])
