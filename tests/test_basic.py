def test_index():
    from app import create_app
    client = create_app().test_client()
    rv = client.get('/')
    assert rv.status_code == 200
    assert b"WiFi Billing System API" in rv.data
