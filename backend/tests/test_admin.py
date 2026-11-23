def test_admin_analytics(client, admin_token):
    response = client.get(
        "/api/admin/analytics",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_emergencies" in data
    assert "active_emergencies" in data
    assert "available_ambulances" in data
    assert "registered_hospitals" in data


def test_admin_users(client, admin_token):
    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_reports_export_csv(client, admin_token):
    response = client.get(
        "/api/admin/reports/export",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
