from django.shortcuts import render
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.response import Response
import json
# fruit
from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers.json import SimpleJsonOutputParser
# surfer
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.chains.conversation.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain import hub
# movie
from langchain_community.graphs import Neo4jGraph

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.neo4j_vector import Neo4jVector
from django.conf import settings


class LangChainPartOne(APIView):
# Create your views here.
    @csrf_exempt
    def fruit_langchain_tutorial(request):
        llm = OpenAI(openai_api_key= settings.OPENAI_KEY)
        template = PromptTemplate.from_template("""
        You are a cockney fruit and vegetable seller.
        Your role is to assist your customer with their fruit and vegetable needs.
        Respond using cockney rhyming slang.

        Output JSON as {{"description": "your response here"}}

        Tell me about the following fruit: {fruit}
        """)
        llm_chain = LLMChain(
            llm= llm,
            prompt= template,
            output_parser=SimpleJsonOutputParser()
        )

        response = llm_chain.invoke({'fruit': 'apple'})
        return JsonResponse({'message' : response})
    
    @csrf_exempt
    def get(self, request):
        chat_llm = ChatOpenAI(openai_api_key="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")
        prompt = PromptTemplate(
            template="""You are a surfer dude, having a conversation about the surf conditions on the beach.
        Respond using surfer slang.
        Context: {context}
        Question: {question}
        """,
            input_variables=["context", "question"],
        )
        chat_chain = LLMChain(
            llm=chat_llm, 
            prompt=prompt
            )
        current_weather = {"surf": [
                    {"beach": "Fistral", "conditions": "6ft waves and offshore winds"},
                    {"beach": "Polzeath", "conditions": "Flat and calm"},
                    {"beach": "Watergate Bay", "conditions": "3ft waves and onshore winds"}]}
        response = chat_chain.invoke(
            {
                "context": current_weather,
                "question": "What is the weather like on Watergate Bay?",
            }
        )
        return JsonResponse(response)
    # @csrf_exempt
    # def post(self, request):
    #     chat_llm = ChatOpenAI(openai_api_key="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")
    #     try:
    #         data = request.POST
    #         prompt = PromptTemplate(
    #         template="""
    #         You are a surfer dude, having a conversation about the surf conditions on the beach.
    #         Respond using surfer slang.

    #         Chat History: {chat_history}
    #         Context: {context}
    #         Question: {question}
    #         """,
    #             input_variables=["chat_history", "context", "question"],
    #         )

    #         memory = ConversationBufferMemory(
    #             memory_key="chat_history", input_key="question", return_messages=True
    #         )

    #         chat_chain = LLMChain(llm=chat_llm, prompt=prompt, memory=memory, verbose=True)

    #         current_weather = """
    #             {
    #                 "surf": [
    #                     {"beach": "Fistral", "conditions": "6ft waves and offshore winds"},
    #                     {"beach": "Bells", "conditions": "Flat and calm"},
    #                     {"beach": "Watergate Bay", "conditions": "3ft waves and onshore winds"}
    #                 ]
    #             }"""

    #         while True:
    #             question = input("> ")
    #             response = chat_chain.invoke({"context": current_weather, "question": question})

    #             print(response["text"])
                
    #     except KeyError as e:
    #         return JsonResponse({'error': str(e)}, status=400)
class Movie(APIView):
    @csrf_exempt
    def get(self, request):
        graph = Neo4jGraph(
        url="bolt://18.213.192.6:7687",
        username="neo4j",
        password="figures-shortage-yells"
        )

        result = graph.query("""
        MATCH (m:Movie{title: 'Stand By Me'}) 
        RETURN m.title, m.tagline, m.released
        """)

        return JsonResponse({'response': result})

class MovieTwo(APIView):
    @csrf_exempt
    def get(self, request):
        embedding_provider = OpenAIEmbeddings(
        openai_api_key="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"
        )
        person_name_vector = Neo4jVector.from_existing_index(
        embedding_provider,
        url="bolt://18.213.192.6:7687",
        username="neo4j",
        password="figures-shortage-yells",
        index_name="constraint_e26b1a8b",
        node_label="Person",
        text_node_property="name",
        embedding_node_property="embedding",
        )
        result = person_name_vector.similarity_search("A person whose name starts with a K and ends with an a.")
        return JsonResponse(result)
       


        




                        
