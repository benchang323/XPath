from neo4j import GraphDatabase
from django.conf import settings
import logging
logger = logging.getLogger(__name__)
from django.http import JsonResponse

class Neo4jBucketListRepo:
    def add_to_bucketlist(self, profile, location):
        logger.error(profile)
        logger.error(location)
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        escaped_location = location.replace("'", "\\'")  # Escape single quotes
        no_space = escaped_location.replace(" ", "")
        logger.error(escaped_location)
        driver.verify_connectivity()
        loc = f"{escaped_location}"
        cypher_query = f"""
        MERGE (d:Destination {{
        location: '{loc}'
        }})
        """
        cypher_query2 = f"""
        MATCH (p:Profile {{profile_id: {profile}}})
        MATCH (d:Destination {{location: '{loc}'}})
        WHERE NOT EXISTS((p)-[:WANTS_TO_VISIT]->(d))
        CREATE (p)-[:WANTS_TO_VISIT]->(d)
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
    def delete_from_bucketlist(self, profile, location):
        logger.error(profile)
        logger.error(location)
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        escaped_location = location.replace("'", "\\'")  # Escape single quotes
        logger.error(escaped_location)
        driver.verify_connectivity()
        loc = f"{escaped_location}"
        cypher_check_query = f"""
        MATCH (d:Destination {{location: '{loc}'}})
        WITH d
        WHERE EXISTS((:Profile)-[:WANTS_TO_VISIT]->(d))
        RETURN COUNT(d) AS count
        """
        cypher_delete_query = f"""
        MATCH (p:Profile {{profile_id: {profile}}})-[r:WANTS_TO_VISIT]->(d:Destination {{location: '{loc}'}})
        DELETE r
        """
        cypher_delete_destination_query = f"""
        MATCH (d:Destination {{location: '{loc}'}})
        DELETE d
        """

        with driver.session() as session:
            # Delete the relationship first before checking count on destination node
            result_delete = session.run(cypher_delete_query)
            if result_delete:
                logger.error('Deleted relationship')
            else:
                logger.error('Error deleting relationship in neo4j db')
            # Check if any profiles have a relationship to the destination node
            result_check = session.run(cypher_check_query)
            count = result_check.single()['count']
            logger.error(count)

            if count == 0:
                # No relationships pointing to the destination so it's safe to delete the destination node (no reason to keep it if it's just independent)
                result_delete_destination = session.run(cypher_delete_destination_query)
                if result_delete_destination:
                    logger.error('Deleted destination node')
                else:
                    logger.error('Error deleting destination node in neo4j db')

    # def edit_destination_in_bucketlist(self, profile, original_location, new_location):
    #     # Delete relationship, then add new
    #     self.delete_from_bucketlist(profile, original_location)
    #     self.add_to_bucketlist(profile, new_location)
    
    def get_all_destinations_liked_by_profile(self, profile):
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        cypher_query = f"""
        MATCH (p:Profile {{profile_id: {profile}}})-[:WANTS_TO_VISIT]->(d:Destination)
        RETURN d.location AS location
        """
        with driver.session() as session:
            result = session.run(cypher_query)
            destinations = [record['location'] for record in result]
            return destinations