from app.core.security import create_access_token
def test_jwt_builds():
    tok = create_access_token({"sub":"demo@user.com"})
    assert tok.count('.') == 2
