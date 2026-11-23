def test_create_emergency(client, patient_token):
    response = client.post(
        "/api/emergencies",
        headers={"Authorization": f"Bearer {patient_token}"},
        json={
            "emergency_type": "CARDIAC",
            "severity": "CRITICAL",
            "description": "Chest pain test",
            "latitude": 51.5074,
            "longitude": -0.1278,
            "contact_name": "Test Contact",
            "contact_phone": "+447700900000",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["emergency_type"] == "CARDIAC"
    assert data["severity"] == "CRITICAL"
    assert data["status"] in ["REPORTED", "AMBULANCE_ASSIGNED", "SEARCHING_AMBULANCE"]
    assert data["latitude"] == 51.5074


def test_list_emergencies_patient(client, patient_token):
    # Create emergency first
    client.post(
        "/api/emergencies",
        headers={"Authorization": f"Bearer {patient_token}"},
        json={
            "emergency_type": "ACCIDENT",
            "severity": "HIGH",
            "latitude": 51.5000,
            "longitude": -0.1200,
        },
    )
    response = client.get(
        "/api/emergencies",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_cancel_emergency(client, patient_token):
    create_res = client.post(
        "/api/emergencies",
        headers={"Authorization": f"Bearer {patient_token}"},
        json={
            "emergency_type": "TRAUMA",
            "severity": "MEDIUM",
            "latitude": 51.5000,
            "longitude": -0.1200,
        },
    )
    e_id = create_res.json()["id"]

    cancel_res = client.post(
        f"/api/emergencies/{e_id}/cancel",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"
