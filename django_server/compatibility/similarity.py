from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.neo4j_vector import Neo4jVector
from django.conf import settings
from django.http import JsonResponse
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer

from langchain_openai import ChatOpenAI
from langchain_community.graphs import Neo4jGraph
from langchain.chains import GraphCypherQAChain
from langchain.prompts import PromptTemplate

from neo4j import GraphDatabase
import logging
logger = logging.getLogger(__name__)

@csrf_exempt
# @renderer_classes((TemplateHTMLRenderer, JSONRenderer))
def similarity_search (request):
    name = request.POST.get('name', False)
    embedding_provider = OpenAIEmbeddings(
        openai_api_key=settings.OPENAI_KEY
    )

    user_bio_vector = Neo4jVector.from_existing_index(
        embedding_provider,
        url=settings.NEO4J_URI,
        username=settings.NEO4J_USERNAME,
        password=settings.NEO4J_PASSWORD,
        index_name="userBios",
        embedding_node_property="embedding",
        text_node_property="bio",
    )

    result = user_bio_vector.similarity_search(name, k=50)
    for doc in result:
        logger.error((doc.metadata["full_name"], "-", doc.page_content))
        return JsonResponse({'message': 'hi'})

@csrf_exempt
def cypher_query(request):
    body = request.POST
    name = body["name"]
    llm = ChatOpenAI(openai_api_key=settings.OPENAI_KEY)   
    graph = Neo4jGraph(
    url=settings.NEO4J_URI,
    username=settings.NEO4J_USERNAME, 
    password=settings.NEO4J_PASSWORD,
    )
    CYPHER_GENERATION_TEMPLATE = """
    You are an expert Neo4j Developer translating user questions into Cypher to answer questions about people and provide recommendations for people like themselves. You should return a list of people's full names, and in parentheses for each person, give me a similarity score as well.
    Convert the user's question based on the schema.

    Schema: {schema}
    Question: {question}
    """

    cypher_generation_prompt = PromptTemplate(
        template=CYPHER_GENERATION_TEMPLATE,
        input_variables=["schema", "question"],
    )

    cypher_chain = GraphCypherQAChain.from_llm(
        llm,
        graph=graph,
        cypher_prompt=cypher_generation_prompt,
        verbose=True
    )

    result = cypher_chain.invoke({"query": f"Tell me about {name}."})
    logger.error(result)
    return JsonResponse({'message':'message'})
@csrf_exempt
def actual_cypher_query (request):
    body = request.POST
    name = body["profile_id"]
    driver = GraphDatabase.driver(
        settings.NEO4J_URI,
        auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
    )
    driver.verify_connectivity()
    input = "{" + f"profile_id: {name}" + "}"
    cypher_query = f"""
    MATCH (p:Profile {input})
    CALL db.index.vector.queryNodes('userBios', 60, p.embedding)
    YIELD node, score
    RETURN node.profile_id AS profile_id, node.bio AS bio score
    """
    # logger.error(cypher_query)
    records=[]
    # Execute the Cypher query
    with driver.session() as session:
        result = session.run(cypher_query)
        for record in result:
            records.append({
                "profile_id": record["profile_id"],
                "bio": record["bio"],
                "score": record["score"]
            })
    # Process the query result
    # logger.error(records)
    driver.close()
    return JsonResponse(list(records), safe=False)
    for record in records:
        logger.error(record["full_name"], record["profile_id"], record["score"])

    # Close the Neo4j driver
    driver.close()