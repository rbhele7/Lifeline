def test_register_patient(client):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "New Patient",
            "email": "new.patient@example.com",
            "phone": "+447700900111",
            "password": "Password@123",
            "role": "patient",
            "emergency_contact": "+447700900999",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new.patient@example.com"
    assert data["role"] == "patient"
    assert "password_hash" not in data


def test_register_duplicate_email(client, patient_user):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Duplicate",
            "email": patient_user.email,
            "password": "Password@123",
            "role": "patient",
        },
    )
    assert response.status_code == 400


def test_login_success(client, patient_user):
    response = client.post(
        "/api/auth/login",
        data={"username": patient_user.email, "password": "Patient@123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == patient_user.email


def test_login_json_success(client, patient_user):
    response = client.post(
        "/api/auth/login/json",
        json={"email": patient_user.email, "password": "Patient@123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_invalid_password(client, patient_user):
    response = client.post(
        "/api/auth/login",
        data={"username": patient_user.email, "password": "WrongPassword"},
    )
    assert response.status_code == 401


def test_get_me(client, patient_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "patient"
