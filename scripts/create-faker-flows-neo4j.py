import random
import uuid
from faker import Faker
from neo4j import GraphDatabase

# Configurazione Neo4j Aura
# NEO4J_URI = "neo4j+s://1f90356b.databases.neo4j.io"
# NEO4J_USERNAME = "neo4j"
# NEO4J_PASSWORD = "NydVLNmyg6dEu6Epn6Tr0d81N6Yo52KSRSZ1L4bYXS8"  # 🔹 Sostituisci con la tua password

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "testtest123"  # o la password che hai messo nel manifest

fake = Faker()

def get_applications(tx):
    query = "MATCH (app:Application) RETURN app.application_id AS id"
    result = tx.run(query)
    return [record["id"] for record in result]

def create_random_application():
    return {
        "application_id": str(uuid.uuid4()),
        "name": fake.company(),
        "description": fake.catch_phrase(),
        "ownerships": fake.name(),
        "application_type": fake.word(),
        "complexity": fake.random_element(["Low", "Medium", "High"]),
        "criticality": fake.random_element(["Low", "Medium", "High", "Critical"]),
        "processes": fake.bs(),
        "active": fake.boolean(),
        "internal_application_specialists": fake.name(),
        "business_partner_business_contacts": fake.name(),
        "business_contacts": fake.name(),
        "internal_developers": fake.name(),
        "hosting": fake.random_element(["On-Premise", "Cloud", "Hybrid"]),
        "ams": fake.company(),
        "bi": fake.boolean(),
        "disaster_recovery": fake.boolean(),
        "user_license_type": fake.word(),
        "access_type": fake.random_element(["Web", "Desktop", "Mobile"]),
        "sw_supplier": fake.company(),
        "ams_expire_date": fake.date_this_decade(),
        "ams_contacts_email": fake.email(),
        "ams_contacts_phone": fake.phone_number(),
        "ams_supplier": fake.company(),
        "smes_factory": fake.word(),
        "ams_portal": fake.url(),
        "organization_family": fake.word(),
        "links_to_documentation": fake.url(),
        "scope": fake.word(),
        "ams_service": fake.bs(),
        "ams_type": fake.word(),
        "decommission_date": fake.date_this_decade(),
        "to_be_decommissioned": fake.boolean(),
        "notes": fake.text(),
        "links_to_sharepoint_documentation": fake.url()
    }

def insert_application(tx, app):
    query = """
    CREATE (a:Application {
        application_id: $application_id,
        name: $name,
        description: $description,
        ownerships: $ownerships,
        application_type: $application_type,
        complexity: $complexity,
        criticality: $criticality,
        processes: $processes,
        active: $active,
        internal_application_specialists: $internal_application_specialists,
        business_partner_business_contacts: $business_partner_business_contacts,
        business_contacts: $business_contacts,
        internal_developers: $internal_developers,
        hosting: $hosting,
        ams: $ams,
        bi: $bi,
        disaster_recovery: $disaster_recovery,
        user_license_type: $user_license_type,
        access_type: $access_type,
        sw_supplier: $sw_supplier,
        ams_expire_date: $ams_expire_date,
        ams_contacts_email: $ams_contacts_email,
        ams_contacts_phone: $ams_contacts_phone,
        ams_supplier: $ams_supplier,
        smes_factory: $smes_factory,
        ams_portal: $ams_portal,
        organization_family: $organization_family,
        links_to_documentation: $links_to_documentation,
        scope: $scope,
        ams_service: $ams_service,
        ams_type: $ams_type,
        decommission_date: $decommission_date,
        to_be_decommissioned: $to_be_decommissioned,
        notes: $notes,
        links_to_sharepoint_documentation: $links_to_sharepoint_documentation
    })
    RETURN a
    """
    tx.run(query, **app)

def create_random_flow(initiator, target):
    return {
        "flow_id": str(uuid.uuid4()),
        "initiator_application": initiator,
        "target_application": target,
        "name": fake.word() + "-flow",
        "description": fake.sentence(),
        "communication_mode": fake.random_element(["synchronous", "asynchronous"]),
        "intent": fake.sentence(),
        "message_format": fake.random_element(["csv", "json", "binary"]),
        "data_flow": fake.word(),
        "protocol": fake.random_element(["HTTP", "FTP", "JMS", "AMQP"]),
        "frequency": fake.random_element(["batch", "realtime"]),
        "estimated_calls_per_day": fake.random_int(-1, 10000),
        "average_execution_time_in_sec": fake.random_int(-1, 3600),
        "average_message_size_in_kb": fake.random_int(-1, 500),
        "api_gateway": fake.boolean(),
        "release_date": fake.date_this_decade(),
        "notes": fake.text(),
        "labels": f"{fake.word()},{fake.word()}"
    }

def insert_flow(tx, flow):
    query = """
    MATCH (initiator:Application {application_id: $initiator_application})
    MATCH (target:Application {application_id: $target_application})
    
    CREATE (initiator)-[f:flow {
        flow_id: $flow_id,
        name: $name,
        description: $description,
        initiator_application: $initiator_application,
        target_application: $target_application,
        communication_mode: $communication_mode,
        intent: $intent,
        message_format: $message_format,
        data_flow: $data_flow,
        protocol: $protocol,
        frequency: $frequency,
        estimated_calls_per_day: $estimated_calls_per_day,
        average_execution_time_in_sec: $average_execution_time_in_sec,
        average_message_size_in_kb: $average_message_size_in_kb,
        api_gateway: $api_gateway,
        release_date: $release_date,
        notes: $notes,
        labels: $labels
    }]->(target)
    RETURN f
    """

    tx.run(query, **flow)

def main():
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD), max_connection_lifetime=200, max_connection_pool_size=50, connection_acquisition_timeout=60)

    try:
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
                    flow = create_random_flow(initiator, target)
                    session.execute_write(insert_flow, flow)

                print("✅ Flussi casuali creati con successo!")
    finally:
        driver.close()

if __name__ == "__main__":
    main()
