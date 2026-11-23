def test_list_ambulances(client, patient_token):
    response = client.get(
        "/api/ambulances",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_ambulance_admin(client, admin_token):
    response = client.post(
        "/api/ambulances",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "vehicle_number": "AMB-NEW-999",
            "latitude": 51.5100,
            "longitude": -0.1100,
        },
    )
    assert response.status_code == 201
    assert response.json()["vehicle_number"] == "AMB-NEW-999"


def test_update_location(client, driver_token, driver_user):
    amb_id = driver_user.driver_profile.assigned_ambulance_id
    response = client.put(
        f"/api/ambulances/{amb_id}/location",
        headers={"Authorization": f"Bearer {driver_token}"},
        json={
            "latitude": 51.5200,
            "longitude": -0.1000,
            "is_simulated": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["latitude"] == 51.5200


def test_toggle_availability(client, admin_token, driver_user):
    amb_id = driver_user.driver_profile.assigned_ambulance_id
    response = client.put(
        f"/api/ambulances/{amb_id}/availability",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "OUT_OF_SERVICE"
