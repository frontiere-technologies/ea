import random
import uuid
from faker import Faker
from neo4j import GraphDatabase

# Configurazione Neo4j Aura
NEO4J_URI = "neo4j+s://1f90356b.databases.neo4j.io"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "NydVLNmyg6dEu6Epn6Tr0d81N6Yo52KSRSZ1L4bYXS8"  # 🔹 Sostituisci con la tua password

fake = Faker()

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD), max_connection_lifetime=200, max_connection_pool_size=50, connection_acquisition_timeout=60)

def get_applications(tx):
    query = "MATCH (app:Application) RETURN app.application_id AS id"
    result = tx.run(query)
    return [record["id"] for record in result]

def create_random_application():
    return {
        "application_id": str(uuid.uuid4()),
        "name": fake.company(),
        "description": fake.catch_phrase(),
        "owner": fake.name()
    }

def insert_application(tx, app):
    query = """
    CREATE (a:Application {
        application_id: $application_id,
        name: $name,
        description: $description,
        owner: $owner
    })
    """
    tx.run(query, **app)

def create_random_business_flow(initiator, target):
    return {
        "business_flow_id": str(uuid.uuid4()),
        "initiator_application_id": initiator,
        "target_application_id": target,
        "name": fake.word() + "-flow",
        "description": fake.sentence(),
        "type": fake.word(),
        "frequency": fake.random_element(["batch", "realtime"]),
        "estimated_calls_per_day": fake.random_int(-1, 10000),
        "average_execution_time_in_sec": fake.random_int(-1, 3600),
        "average_message_size_in_kb": fake.random_int(-1, 500),
        "release_date": fake.date_this_decade(),
        "intent": fake.sentence(),
        "communication_mode": fake.random_element(["synchronous", "asynchronous"]),
        "data_flow": fake.word(),
        "message_format": fake.random_element(["csv", "json", "binary"])
    }

def insert_business_flow(tx, flow):
    query = """
    MATCH (app_from:Application {application_id: $initiator_application_id}),
          (app_to:Application {application_id: $target_application_id})
    CREATE (app_from)-[:BUSINESS_FLOW {
        flow_id: $business_flow_id,
        name: $name,
        description: $description,
        type: $type,
        frequency: $frequency,
        estimated_calls_per_day: $estimated_calls_per_day,
        average_execution_time_in_sec: $average_execution_time_in_sec,
        average_message_size_in_kb: $average_message_size_in_kb,
        release_date: date($release_date),
        intent: $intent,
        communication_mode: $communication_mode,
        data_flow: $data_flow,
        message_format: $message_format
    }]->(app_to)
    """

    tx.run(query, **flow)

with driver.session() as session:
    applications = session.execute_read(get_applications)

    if len(applications) < 10:
        print(f"⚠️  Trovate solo {len(applications)} applicazioni. Generazione di 50 applicazioni fake...")
        for _ in range(50):
            app = create_random_application()
            session.execute_write(insert_application, app)
        applications = session.execute_read(get_applications)

    if len(applications) < 2:
        print(f"⚠️  Attenzione: Trovate solo {len(applications)} applicazioni. Necessarie almeno 2 per creare relazioni.")
    else:
        for _ in range(200):
            initiator, target = random.sample(applications, 2)
            business_flow = create_random_business_flow(initiator, target)
            session.execute_write(insert_business_flow, business_flow)

        print("✅ Flussi casuali creati con successo!")
