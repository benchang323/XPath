from neo4j import GraphDatabase
from django.conf import settings
import logging
logger = logging.getLogger(__name__)
from . import neo_profile_repo

class Neo4jUserRepo:
    def create_user(self, username, password, email, phoneNumber, id):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        escaped_username = username.replace("'", "\\'")  # Escape single quotes
        #remove all extra symbols and spaces from username
        remove_all_symbols = escaped_username.replace(" ", "").replace("-", "").replace("_", "").replace(".", "").replace(",", "").replace("'", "").replace("!", "").replace("@", "").replace("#", "").replace("$", "").replace("%", "").replace("^", "").replace("&", "").replace("*", "").replace("(", "").replace(")", "").replace("+","")
        escaped_password = password.replace("'", "\\'")  # Escape single quotes
        escaped_email = email.replace("'", "\\'")  # Escape single quotes
        escaped_phone = phoneNumber.replace("'", "\\'")  # Escape single quotes
        identifier = f"User{id}"
        driver.verify_connectivity()
        input = "{" + f"username: '{escaped_username}', password: '{escaped_password}', email: '{escaped_email}', phoneNumber: '{escaped_phone}', user_account_id: {id}" + "}"
        cypher_query = f"""
        MERGE ({identifier}:User {input})
        """
        with driver.session() as session:
            result = session.run(cypher_query)
            if (result):
                logger.error('added')
            else:
                logger.error('error adding to neo4j db')
        driver.close()
    
    # def edit_user(self, username, password, id):
    #     driver = GraphDatabase.driver(
    #         settings.NEO4J_URI,
    #         auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
    #     )
    #     driver.verify_connectivity()
    #     input = "{" + f"password: '{password}'" + "}"
    #     cypher_query = f"""
    #     MATCH ({username}:User {{user_account_id: {id}}})
    #     SET {username} += {input}
    #     """
    #     with driver.session() as session:
    #         result = session.run(cypher_query)
    #         if (result):
    #             logger.error('added')
    #         else:
    #             logger.error('error adding to neo4j db')
    #     driver.close()
    
    def edit_user(self, username, password, id):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI, auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()

        escaped_password = password.replace("'", "\\'")  # Escape single quotes

        cypher_query = f"""
        MATCH (u:User {{user_account_id: {id}}})
        SET u.password = '{escaped_password}'
        RETURN u
        """

        with driver.session() as session:
            result = session.run(cypher_query)
            record = result.single()
            if record:
                logger.error('User updated successfully')
            else:
                logger.error('User not found or error updating user in Neo4j db')

        driver.close()
        
    def delete_user(self, id):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        cypher_query = f"""
        MATCH (user:User {{user_account_id: {id}}})
        DETACH DELETE user
        """
        cypher_query_delete_profiles = f"""
        MATCH (profile:Profile {{user_account_id: {id}}})
        DELETE profile
        """
        with driver.session() as session:
            session.run(cypher_query_delete_profiles)
            result = session.run(cypher_query)
            if (result):
                logger.error('added')
            else:
                logger.error('error adding to neo4j db')
        driver.close()
    