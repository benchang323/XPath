import csv
import os

from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.http import JsonResponse
from openai import OpenAI
from neo4j import GraphDatabase
import logging
import os
from openai import APIError
from neo4j import GraphDatabase, Result
import pandas as pd
from time import sleep
from .service import compatibility_service

logger = logging.getLogger(__name__)

def generate_embeddings(file_name, limit=None):

    client = OpenAI(api_key=settings.OPENAI_KEY)  # Creating OpenAI client

    # Establish connection to Neo4j database
    driver = GraphDatabase.driver(
        settings.NEO4J_URI,
        auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
    )
    driver.verify_connectivity()

    # Construct Cypher query to fetch data
    query = """MATCH (p:Person) WHERE p.bio IS NOT NULL
    RETURN p.profile_id AS profile_id, p.user AS user, p.bio AS bio"""

    # Add LIMIT clause if limit is specified
    if limit is not None:
        query += f" LIMIT {limit}"

    # Execute query and transform result to DataFrame
    people = driver.execute_query(query, result_transformer_=Result.to_df)

    print(len(people))

    embeddings = []

    # Iterate over DataFrame rows
    for _, n in people.iterrows():
        successful_call = False
        while not successful_call:
            try:
                # Create embedding using OpenAI
                res = client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=f"{n['user']}: {n['bio']}",
                    encoding_format="float"
                )
                successful_call = True
            except APIError as e:
                print(e)
                print("Retrying in 5 seconds...")
                sleep(5)

        print(n['user'])

        embeddings.append({"profile_id": n['profile_id'], "embedding": res.data[0].embedding})

    # Convert embeddings list to DataFrame
    # logger.error(embeddings)
    embedding_df = pd.DataFrame(embeddings)

    # Save DataFrame to CSV file
    try:
        csv_data = embedding_df.to_csv(index=False).encode('utf-8')
        comp_serv_obj = compatibility_service.CompatibilityService()
        action = comp_serv_obj.store_embeddings_csv(csv_data, str(file_name))
        if action:
            logger.error('successfully saved in digital ocean space')
        else:
            logger.error('not saved')
        logger.error(f"CSV file saved successfully at: {file_name}")  # Debugging statement
    except Exception as e:
        logger.error(f"Error occurred while saving CSV file: {e}")  # Debugging statement
    # Close Neo4j driver
    driver.close()

@csrf_exempt    
def generate_embeddings_req(request):  
    try:
        # Ensure data directory exists
        data_directory = os.path.join(settings.BASE_DIR, 'data')
        if not os.path.exists(data_directory):
            logger.error('creating a path right now')
            os.makedirs(data_directory)

        # Generate embeddings and save to CSV files
        generate_embeddings('openai-embeddings', limit=1000)
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def generate_embedding_for_profile(user_id):
        client = OpenAI(api_key=settings.OPENAI_KEY)  # Creating OpenAI client

        # Establish connection to Neo4j database
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        prof = f"Profile {user_id}"

        # Construct Cypher query to fetch data for a specific profile ID
        query = f"""
        MATCH (p:Profile {{user_id: {user_id}}})
        WHERE p.bio IS NOT NULL
        RETURN p.profile_id AS profile_id, p.bio AS bio
        """

        # Execute the query
        with driver.session() as session:
            result = session.run(query)
            records = [record for record in result]

        if not records:
            logger.error(f"No profile found for user ID: {user_id}")
            return

        user = records[0]["profile_id"]
        bio = records[0]["bio"]
        

        successful_call = False
        while not successful_call:
            try:
                # Create embedding using OpenAI
                res = client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=f"{user}: {bio}",
                    encoding_format="float"
                )
                successful_call = True
            except APIError as e:
                logger.error(e)
                logger.error("Retrying in 5 seconds...")
                sleep(5)

            logger.error(f"Embedding generated for profile ID: {user_id}")

        embedding = res.data[0].embedding
        cypher_query = f"""
        MATCH (p:Profile {{user_id: {user_id}}})
        CALL db.create.setNodeVectorProperty(p, 'embedding', {embedding})
        RETURN count(*)
        """
        # process embedding now
        with driver.session() as session:
            result = session.run(cypher_query)
        
        # logger.error("Embedding:", embedding)

        driver.close()
def update_embedding_for_profile(user_id):
    client = OpenAI(api_key=settings.OPENAI_KEY)  # Creating OpenAI client

    # Establish connection to Neo4j database
    driver = GraphDatabase.driver(
        settings.NEO4J_URI,
        auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
    )
    driver.verify_connectivity()

    # Construct Cypher query to fetch data for a specific profile ID
    query = f"""
    MATCH (p:Profile {{user_id: {user_id}}})
    WHERE p.bio IS NOT NULL
    RETURN p.profile_id AS profile_id, p.bio AS bio
    """

    # Execute the query
    with driver.session() as session:
        result = session.run(query)
        records = [record for record in result]

    if not records:
        logger.error(f"No profile found for user ID: {user_id}")
        return

    bio = records[0]["bio"]

    successful_call = False
    while not successful_call:
        try:
            # Create embedding using OpenAI
            res = client.embeddings.create(
                model="text-embedding-ada-002",
                input=f"{user_id}: {bio}",
                encoding_format="float"
            )
            successful_call = True
        except APIError as e:
            logger.error(e)
            logger.error("Retrying in 5 seconds...")
            sleep(5)

    logger.error(f"Embedding generated for profile ID: {user_id}")

    embedding = res.data[0].embedding

    # Check if the embedding property exists
    cypher_query_check = f"""
    MATCH (p:Profile {{user_id: {user_id}}})
    WHERE p.embedding IS NOT NULL
    RETURN count(p) AS count
    """

    with driver.session() as session:
        result = session.run(cypher_query_check)
        count = result.single()["count"]

    if count > 0:
        # If the embedding property exists, update it
        cypher_query_update = f"""
        MATCH (p:Profile {{user_id: {user_id}}})
        SET p.embedding = {embedding}
        """
        with driver.session() as session:
            session.run(cypher_query_update)
    else:
        # If the embedding property doesn't exist, create it
        cypher_query_create = f"""
        MATCH (p:Profile {{user_id: {user_id}}})
        CALL db.create.setNodeVectorProperty(p, 'embedding', {embedding})
        RETURN count(*)
        """
        with driver.session() as session:
            session.run(cypher_query_create)

    # logger.error("Embedding:", embedding)

    driver.close()
