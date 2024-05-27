from neo4j import GraphDatabase
from django.conf import settings
import logging
logger = logging.getLogger(__name__)
from compatibility.embedding import generate_embedding_for_profile, update_embedding_for_profile
class Neo4jProfileRepo:
    def create_profile(self, bio, profile_id, user_id):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        escaped_bio = bio.replace("'", "\\'")  # Escape single quotes
        driver.verify_connectivity()
        acc_info = f"user_account_id: {user_id}"
        prof = f"Profile{user_id}"
        cypher_query = f"""
        MERGE ({prof}:Profile {{
        profile_id: {profile_id},
        bio: '{escaped_bio}',
        user_id: {user_id}
        }})
        """
        cypher_query2 = f"""
        MATCH (u:User {{user_account_id: {user_id}}})
        MATCH (p:Profile {{profile_id: {profile_id}}})
        WHERE NOT EXISTS((u)-[:HAS_PROFILE]->(p))
        CREATE (u)-[:HAS_PROFILE]->(p)
        """
        
        with driver.session() as session:
            result = session.run(cypher_query)
            if (result):
                logger.error('added')
            else:
                logger.error('error adding to neo4j db')
            result = session.run(cypher_query2)
            if (result):
                logger.error('added')
            else:
                logger.error('error adding to neo4j db')
        generate_embedding_for_profile(user_id)
        driver.close()
        
    def delete_profile(self, user_id):
        cypher_query = f"""
            MATCH (p:Profile {{user_id: {user_id}}})-[r]-()
            DELETE r, p
            """
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        with driver.session() as session:
            result = session.run(cypher_query)
            if (result):
                logger.error('deleted profile')
            else:
                logger.error('error deleting from neo4j db')
        driver.close()
        
    def update_profile(self, bio, profile_id, user_id):
        escaped_bio = bio.replace("'", "\\'")  # Escape single quotes
        input = f"""
        {{
        profile_id: {profile_id},
        bio: '{escaped_bio}',
        user_id: {user_id},
        }}
        """
        cypher_query = f"""
            MATCH (p:Profile {{user_id: {user_id}}})
            SET p += {input}
            """
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        with driver.session() as session:
            result = session.run(cypher_query)
            if (result):
                logger.error('updating profile')
            else:
                logger.error('error updating neo4j db')
        update_embedding_for_profile(user_id)
        driver.close()