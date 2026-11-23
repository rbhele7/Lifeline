def test_list_hospitals(client, patient_token):
    response = client.get(
        "/api/hospitals",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_hospital_capacity(client, hospital_token, hospital_admin_user):
    from app.models.hospital import Hospital
    # Hospital ID
    response = client.put(
        "/api/hospitals/1/capacity",
        headers={"Authorization": f"Bearer {hospital_token}"},
        json={"total_beds": 200, "available_beds": 50},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["available_beds"] == 50


def test_hospital_recommendation(client, patient_token):
    # Create emergency
    e_res = client.post(
        "/api/emergencies",
        headers={"Authorization": f"Bearer {patient_token}"},
        json={
            "emergency_type": "CARDIAC",
            "severity": "CRITICAL",
            "latitude": 51.5074,
            "longitude": -0.1278,
        },
    )
    e_id = e_res.json()["id"]

    rec_res = client.get(
        f"/api/hospitals/recommend?emergency_id={e_id}",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert rec_res.status_code == 200
    data = rec_res.json()
    assert isinstance(data, list)
