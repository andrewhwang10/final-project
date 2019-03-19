package users

import "testing"

//TODO: add tests for the various functions in user.go, as described in the assignment.
//use `go test -cover` to ensure that you are covering all or nearly all of your code paths.
var validUser = &NewUser{
	Email:        "abc@abc.com",
	Password:     "123456",
	PasswordConf: "123456",
	UserName:     "abcabc",
	FirstName:    "John",
	LastName:     "Doe",
}

func TestValidate(t *testing.T) {
	nu := &NewUser{
		Email:        "abc@abc.com",
		Password:     "123456",
		PasswordConf: "123456",
		UserName:     "abcabc",
		FirstName:    "John",
		LastName:     "Doe",
	}

	err := nu.Validate()
	if err != nil {
		t.Errorf("unexpected error validating valid user: %v", err)
	}

	nu.Email = "abc.com"
	err = nu.Validate()
	if err == nil {
		t.Errorf("expecting error validating invalid email")
	}
	nu.Email = validUser.Email

	nu.Password = "123"
	err = nu.Validate()
	if err == nil {
		t.Errorf("expecting error validating short password: must be at least 6 characters")
	}
	nu.Password = validUser.Password

	nu.PasswordConf = "123455"
	err = nu.Validate()
	if err == nil {
		t.Errorf("expecting error validating non-matching passwords: passwordconf and password must match")
	}
	nu.PasswordConf = validUser.PasswordConf

	nu.UserName = ""
	err = nu.Validate()
	if err == nil {
		t.Errorf("expecting error validating invalid username: must be non-zero length")
	}
	nu.UserName = validUser.UserName

	nu.UserName = "fds fds"
	err = nu.Validate()
	if err == nil {
		t.Errorf("expecting error validating invalid username: must have no spaces")
	}
}

func TestToUser(t *testing.T) {
	user, err := validUser.ToUser()
	if user == nil && err != nil {
		t.Errorf("didn't expect an error: valid user")
	}
}

func TestFullName(t *testing.T) {
	user, err := validUser.ToUser()
	if err != nil {
		t.Errorf("didn't expect error: getting user")
	}
	name := user.FullName()
	if name != "John Doe" {
		t.Errorf("expected FullName() to return \"John Doe\" but got %s", name)
	}
	user.LastName = ""
	name = user.FullName()
	if name != "John" {
		t.Errorf("expected FullName() to return \"John\" but got %s", name)
	}
	user.LastName = "Doe"
	user.FirstName = ""
	name = user.FullName()
	if name != "Doe" {
		t.Errorf("expected FullName() to return \"Doe\" but got %s", name)
	}
	user.LastName = ""
	name = user.FullName()
	if name != "" {
		t.Errorf("expected FullName() to return \"\" but got %s", name)
	}
	user.FirstName = "John"
	user.LastName = "Doe"
}

func TestAuthenticate(t *testing.T) {
	user, err := validUser.ToUser()
	if err != nil {
		t.Errorf("unexpected error creating user")
	}
	err = user.Authenticate("123456")
	if err != nil {
		t.Errorf("unexpected error when validating valid password: %v", err)
	}
}

func TestApplyUpdate(t *testing.T) {
	updates := &Updates{
		FirstName: "Jane",
		LastName:  "Smith",
	}
	user, err := validUser.ToUser()
	if err != nil {
		t.Errorf("unexpected error creating user")
	}
	err = user.ApplyUpdates(nil)
	if err == nil {
		t.Errorf("expected error when applying nil update: %v", err)
	}
	err = user.ApplyUpdates(updates)
	if user.FirstName != updates.FirstName && user.LastName != updates.LastName {
		t.Errorf("expected values are not found: %s %s", updates.FirstName, updates.LastName)
	}
}
