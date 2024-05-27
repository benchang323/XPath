from neo4j import GraphDatabase
from django.conf import settings
import logging
logger = logging.getLogger(__name__)
from django.http import JsonResponse

class Neo4jMatchRepo:
    def add_request(self, from_profile, to_profile):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        cypher_query1 = f"""
        MATCH (p1:Profile {{profile_id: {from_profile}}})
        MATCH (p2:Profile {{profile_id: {to_profile}}})
        MATCH (p1)-[r:IGNORES]->(p2)
        DELETE r
        """
        cypher_query = f"""
        MATCH (p1:Profile {{profile_id: {from_profile}}})
        MATCH (p2:Profile {{profile_id: {to_profile}}})
        WHERE NOT EXISTS((p1)-[:LIKES]->(p2))
        CREATE (p1)-[:LIKES]->(p2)
        """
        with driver.session() as session:
            result = session.run(cypher_query1)
            if (result):
                logger.error('ignore removed')
            else:
                logger.error('error removing ignore from neo4j db')
            result = session.run(cypher_query)
            if (result):
                logger.error('request added')
            else:
                logger.error('error adding request to neo4j db')
        driver.close()
    def add_rejection(self, from_profile, to_profile):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        cypher_query1 = f"""
        MATCH (p1:Profile {{profile_id: {from_profile}}})
        MATCH (p2:Profile {{profile_id: {to_profile}}})
        MATCH (p1)-[r:IGNORES]->(p2)
        DELETE r
        """
        cypher_query = f"""
        MATCH (p1:Profile {{profile_id: {from_profile}}})
        MATCH (p2:Profile {{profile_id: {to_profile}}})
        WHERE NOT EXISTS((p1)-[:REJECTS]->(p2))
        CREATE (p1)-[:REJECTS]->(p2)
        """
        with driver.session() as session:
            result = session.run(cypher_query1)
            if (result):
                logger.error('ignore added')
            else:
                logger.error('error removing ignore from neo4j db')
            result = session.run(cypher_query)
            if (result):
                logger.error('rejection added')
            else:
                logger.error('error adding rejection to neo4j db')
        driver.close()
    def add_ignore(self, from_profile, to_profile):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        
        cypher_query = f"""
        MATCH (p1:Profile {{profile_id: {from_profile}}})
        MATCH (p2:Profile {{profile_id: {to_profile}}})
        WHERE NOT EXISTS((p1)-[:IGNORES]->(p2))
        CREATE (p1)-[:IGNORES]->(p2)
        """
        with driver.session() as session:
            result = session.run(cypher_query)
            if (result):
                logger.error('ignore added')
                driver.close()
                return True
            else:
                logger.error('error adding ignore to neo4j db')
                driver.close()
                return False
        
    def undo_rejection(self, from_profile, to_profile):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        
        cypher_query = f"""
        MATCH (p1:Profile {{profile_id: {from_profile}}})
        MATCH (p2:Profile {{profile_id: {to_profile}}})
        MATCH (p1)-[rej:REJECTS]->(p2)
        DELETE rej
        """
        with driver.session() as session:
            result = session.run(cypher_query)
            if (result):
                logger.error('rejection successfully withdrawn')
            else:
                logger.error('error withdrawing rejection from neo4j db')
        driver.close()
        
    def get_match_recommendations (self, profile_id):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        input = f"{{profile_id: '{profile_id}'}}"
        cypher_query = f"""
        MATCH
        (current:Profile {{profile_id: {profile_id}}}),
        (other:Profile)
        WHERE NOT (current)-[:LIKES|REJECTS]->(other) AND current <> other
        CALL db.index.vector.queryNodes('userBios', 1000, current.embedding)
        YIELD node, score
        WHERE NOT (current)-->(node) AND current <> node
        RETURN node.profile_id AS profile_id, score
        LIMIT 50
        """

        logger.error(cypher_query)
        records=[]
        # Execute the Cypher query
        with driver.session() as session:
            result = session.run(cypher_query)
            for record in result:
                records.append({
                    "profile_id": record["profile_id"],
                    "score": record["score"]
                })
        # Process the query result
        # logger.error(records)
        driver.close()
        return (records)
    
    def get_incoming_requests(self, profile_id):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        cypher_query = f"""
        MATCH
        (current:Profile {{profile_id: {profile_id}}}),
        (other:Profile)-[:LIKES]->(current)
        WHERE NOT (current)-->(other)
        RETURN other.profile_id AS profile_id
        """
        records=[]
        # Execute the Cypher query
        with driver.session() as session:
            result = session.run(cypher_query)
            for record in result:
                records.append({
                    "profile_id": record["profile_id"]
                })
        # Process the query result
        # logger.error(records)
        driver.close()
        return records
