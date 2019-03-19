package users

import (
	"database/sql"
	"fmt"
	"log"
	"reflect"
	"regexp"
	"testing"

	sqlmock "gopkg.in/DATA-DOG/go-sqlmock.v1"
)

const GETSTATEMENT = "select * from users where id=?"
const INSERTSTATEMENT = "insert into users(email, pass_hash, user_name, first_name, last_name, photo_url) values (?,?,?,?,?,?)"
const UPDATESTATEMENT = "update users set first_name=?, last_name=? where id=?"
const DELETESTATEMENT = "delete from users where id=?"

func TestNewMySQLStore(t *testing.T) {
	db, _, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()
	ms := NewMySQLStore(db)
	if ms == nil {
		t.Fatalf("error initalizing new MySQLStore")
	}
}

func TestMySQLStore_GetByID(t *testing.T) {
	//create a new sql mock
	db, mock, err := sqlmock.New()
	if err != nil {
		log.Fatalf("error creating sql mock: %v", err)
	}

	//ensure it's closed at the end of the test
	defer db.Close()

	// Initialize a user struct we will use as a test variable
	expectedUser := &User{
		ID:        1,
		Email:     "john@doe.com",
		PassHash:  []byte("123456"),
		UserName:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		PhotoURL:  "fdsa.com/23f",
	}

	// Initialize a MySQLStore struct to allow us to interface with the SQL client
	store := NewMySQLStore(db)

	// Create a row with the appropriate fields in your SQL database
	// Add the actual values to the row
	row := sqlmock.NewRows([]string{"id", "email", "pass_hash", "user_name", "first_name", "last_name", "photo_url"})
	row.AddRow(expectedUser.ID, expectedUser.Email, expectedUser.PassHash, expectedUser.UserName, expectedUser.FirstName, expectedUser.LastName, expectedUser.PhotoURL)

	// Expecting a successful "query"
	// This tells our db to expect this query (id) as well as supply a certain response (row)
	// REMINDER: Since sqlmock requires a regex string, in order for `?` to be interpreted, you'll
	// have to wrap it within a `regexp.QuoteMeta`. Be mindful that you will need to do this EVERY TIME you're
	// using any reserved metacharacters in regex.
	mock.ExpectQuery(regexp.QuoteMeta(GETSTATEMENT)).
		WithArgs(expectedUser.ID).WillReturnRows(row)

	// Since we know our query is successful, we want to test whether there happens to be
	// any expected error that may occur.
	user, err := store.GetByID(expectedUser.ID)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	// Again, since we are assuming that our query is successful, we can test for when our
	// function doesn't work as expected.
	if err == nil && !reflect.DeepEqual(user, expectedUser) {
		t.Errorf("User queried does not match expected user")
	}

	// Expecting a unsuccessful "query"
	// Attempting to search by an id that doesn't exist. This would result in a
	// sql.ErrNoRows error
	// REMINDER: Using a constant makes your code much clear, and is highly recommended.
	mock.ExpectQuery(regexp.QuoteMeta(GETSTATEMENT)).
		WithArgs(-1).WillReturnError(sql.ErrNoRows)

	// Since we are expecting an error here, we create a condition opposing that to see
	// if our GetById is working as expected
	if _, err = store.GetByID(-1); err == nil {
		t.Errorf("Expected error: %v, but recieved nil", sql.ErrNoRows)
	}

	// Attempting to trigger a DBMS querying error
	queryingErr := fmt.Errorf("DBMS error when querying")
	mock.ExpectQuery("Select * From users Where id=?").
		WithArgs(expectedUser.ID).WillReturnError(queryingErr)

	if _, err = store.GetByID(expectedUser.ID); err == nil {
		t.Errorf("Expected error: %v, but recieved nil", queryingErr)
	}

	// // This attempts to check if there are any expectations that we haven't met
	// if err := mock.ExpectationsWereMet(); err != nil {
	// 	t.Errorf("Unmet sqlmock expectations: %v", err)
	// }

}

func TestMySQLStore_GetByEmail(t *testing.T) {
	//create a new sql mock
	db, mock, err := sqlmock.New()
	if err != nil {
		log.Fatalf("error creating sql mock: %v", err)
	}

	//ensure it's closed at the end of the test
	defer db.Close()

	// Initialize a user struct we will use as a test variable
	expectedUser := &User{
		ID:        1,
		Email:     "john@doe.com",
		PassHash:  []byte("123456"),
		UserName:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		PhotoURL:  "fdsa.com/23f",
	}

	// Initialize a MySQLStore struct to allow us to interface with the SQL client
	store := NewMySQLStore(db)

	row := sqlmock.NewRows([]string{"id", "email", "pass_hash", "user_name", "first_name", "last_name", "photo_url"})
	row.AddRow(expectedUser.ID, expectedUser.Email, expectedUser.PassHash, expectedUser.UserName, expectedUser.FirstName, expectedUser.LastName, expectedUser.PhotoURL)

	mock.ExpectQuery(regexp.QuoteMeta("select * from users where email=?")).
		WithArgs(expectedUser.Email).WillReturnRows(row)

	// Since we know our query is successful, we want to test whether there happens to be
	// any expected error that may occur.
	user, err := store.GetByEmail(expectedUser.Email)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	// Again, since we are assuming that our query is successful, we can test for when our
	// function doesn't work as expected.
	if err == nil && !reflect.DeepEqual(user, expectedUser) {
		t.Errorf("User queried does not match expected user")
	}

	// Expecting a unsuccessful "query"
	// Attempting to search by an id that doesn't exist. This would result in a
	// sql.ErrNoRows error
	// REMINDER: Using a constant makes your code much clear, and is highly recommended.
	mock.ExpectQuery(regexp.QuoteMeta("select * from users where email=?")).
		WithArgs("ds").WillReturnError(sql.ErrNoRows)

	// Since we are expecting an error here, we create a condition opposing that to see
	// if our GetById is working as expected
	if _, err = store.GetByEmail("ds"); err == nil {
		t.Errorf("Expected error: %v, but recieved nil", sql.ErrNoRows)
	}

	// Attempting to trigger a DBMS querying error
	queryingErr := fmt.Errorf("DBMS error when querying")
	mock.ExpectQuery("Select * From users Where email=?").
		WithArgs(expectedUser.Email).WillReturnError(queryingErr)

	if _, err = store.GetByEmail(expectedUser.Email); err == nil {
		t.Errorf("Expected error: %v, but recieved nil", queryingErr)
	}
}

func TestMySQLStore_GetByUserName(t *testing.T) {
	//create a new sql mock
	db, mock, err := sqlmock.New()
	if err != nil {
		log.Fatalf("error creating sql mock: %v", err)
	}

	//ensure it's closed at the end of the test
	defer db.Close()

	// Initialize a user struct we will use as a test variable
	expectedUser := &User{
		ID:        1,
		Email:     "john@doe.com",
		PassHash:  []byte("123456"),
		UserName:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		PhotoURL:  "fdsa.com/23f",
	}

	// Initialize a MySQLStore struct to allow us to interface with the SQL client
	store := NewMySQLStore(db)

	// Create a row with the appropriate fields in your SQL database
	// Add the actual values to the row
	row := sqlmock.NewRows([]string{"id", "email", "pass_hash", "user_name", "first_name", "last_name", "photo_url"})
	row.AddRow(expectedUser.ID, expectedUser.Email, expectedUser.PassHash, expectedUser.UserName, expectedUser.FirstName, expectedUser.LastName, expectedUser.PhotoURL)

	// Expecting a successful "query"
	// This tells our db to expect this query (id) as well as supply a certain response (row)
	// REMINDER: Since sqlmock requires a regex string, in order for `?` to be interpreted, you'll
	// have to wrap it within a `regexp.QuoteMeta`. Be mindful that you will need to do this EVERY TIME you're
	// using any reserved metacharacters in regex.
	mock.ExpectQuery(regexp.QuoteMeta("select * from users where user_name=?")).
		WithArgs(expectedUser.UserName).WillReturnRows(row)

	// Since we know our query is successful, we want to test whether there happens to be
	// any expected error that may occur.
	user, err := store.GetByUserName(expectedUser.UserName)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	// Again, since we are assuming that our query is successful, we can test for when our
	// function doesn't work as expected.
	if err == nil && !reflect.DeepEqual(user, expectedUser) {
		t.Errorf("User queried does not match expected user")
	}

	// Expecting a unsuccessful "query"
	// Attempting to search by an id that doesn't exist. This would result in a
	// sql.ErrNoRows error
	// REMINDER: Using a constant makes your code much clear, and is highly recommended.
	mock.ExpectQuery(regexp.QuoteMeta("Select * From users Where user_name=?")).
		WithArgs("ds").WillReturnError(sql.ErrNoRows)

	// Since we are expecting an error here, we create a condition opposing that to see
	// if our GetById is working as expected
	if _, err = store.GetByUserName("ds"); err == nil {
		t.Errorf("Expected error: %v, but recieved nil", sql.ErrNoRows)
	}

	// Attempting to trigger a DBMS querying error
	queryingErr := fmt.Errorf("DBMS error when querying")
	mock.ExpectQuery("Select * From users Where user_name=?").
		WithArgs(expectedUser.UserName).WillReturnError(queryingErr)

	if _, err = store.GetByUserName(expectedUser.UserName); err == nil {
		t.Errorf("Expected error: %v, but recieved nil", queryingErr)
	}
}

func TestMySQLStore_Insert(t *testing.T) {
	//create a new sql mock
	db, mock, err := sqlmock.New()
	if err != nil {
		log.Fatalf("error creating sql mock: %v", err)
	}
	//ensure it's closed at the end of the test
	defer db.Close()

	// Initialize a user struct we will use as a test variable
	inputUser := &User{
		ID:        2,
		Email:     "john@doe.com",
		PassHash:  []byte("123456"),
		UserName:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		PhotoURL:  "fdsa.com/23f",
	}

	// Initialize a MySQLStore struct to allow us to interface with the SQL client
	store := NewMySQLStore(db)

	// This tells our db to expect an insert query with certain arguments with a certain
	// return result
	mock.ExpectExec(regexp.QuoteMeta(INSERTSTATEMENT)).
		WithArgs(inputUser.Email, inputUser.PassHash, inputUser.UserName, inputUser.FirstName, inputUser.LastName, inputUser.PhotoURL).
		WillReturnResult(sqlmock.NewResult(2, 1))

	user, err := store.Insert(inputUser)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if err == nil && !reflect.DeepEqual(user, inputUser) {
		t.Errorf("User returned does not match input user")
	}

	// Inserting an invalid user
	invalidUser := &User{
		ID:        -1,
		Email:     "john@doe.com",
		PassHash:  []byte("123456"),
		UserName:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		PhotoURL:  "fdsa.com/23f",
	}
	insertErr := fmt.Errorf("Error executing INSERT operation")
	mock.ExpectExec("insert into users(email, pass_hash, user_name, first_name, last_name, photo_url) values( ?,?,?,?,?,?)").
		WithArgs(nil, invalidUser.PassHash, invalidUser.UserName, invalidUser.FirstName, invalidUser.LastName, nil).
		WillReturnError(insertErr)

	if _, err = store.Insert(invalidUser); err == nil {
		t.Errorf("Expected error: %v but recieved nil", insertErr)
	}
}

func TestMySQLSTORE_Update(t *testing.T) {
	//create a new sql mock
	db, mock, err := sqlmock.New()
	if err != nil {
		log.Fatalf("error creating sql mock: %v", err)
	}
	//ensure it's closed at the end of the test
	defer db.Close()

	// Initialize a user struct we will use as a test variable
	inputUser := &User{
		ID:        2,
		Email:     "john@doe.com",
		PassHash:  []byte("123456"),
		UserName:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		PhotoURL:  "fdsa.com/23f",
	}
	update := &Updates{
		FirstName: "Joe",
		LastName:  "Biden",
	}

	// Initialize a MySQLStore struct to allow us to interface with the SQL client
	store := NewMySQLStore(db)
	store.Insert(inputUser)

	// This tells our db to expect an update query with certain arguments with a certain
	// return result
	mock.ExpectExec(regexp.QuoteMeta(UPDATESTATEMENT)).
		WithArgs(update.FirstName, update.LastName, inputUser.ID).
		WillReturnResult(sqlmock.NewResult(2, 1))

	user, err := store.Update(inputUser.ID, update)

	if err == nil && !reflect.DeepEqual(user, inputUser) {
		t.Errorf("User returned does not match updated user")
	}

	// Updating a non-existant user
	updateErr := fmt.Errorf("Error executing UPDATE operation")
	mock.ExpectExec(UPDATESTATEMENT).
		WithArgs(update.FirstName, update.LastName, -30)

	if _, err = store.Update(-30, update); err == nil {
		t.Errorf("Expected error: %v but recieved nil", updateErr)
	}
}

func TestMySQLSTORE_Delete(t *testing.T) {
	//create a new sql mock
	db, mock, err := sqlmock.New()
	if err != nil {
		log.Fatalf("error creating sql mock: %v", err)
	}
	//ensure it's closed at the end of the test
	defer db.Close()

	// Initialize a user struct we will use as a test variable
	inputUser := &User{
		ID:        2,
		Email:     "john@doe.com",
		PassHash:  []byte("123456"),
		UserName:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		PhotoURL:  "fdsa.com/23f",
	}

	// Initialize a MySQLStore struct to allow us to interface with the SQL client
	store := NewMySQLStore(db)
	store.Insert(inputUser)

	// This tells our db to expect an delete query with certain arguments with a certain
	// return result
	mock.ExpectExec(regexp.QuoteMeta(DELETESTATEMENT)).
		WithArgs(inputUser.ID).
		WillReturnResult(sqlmock.NewResult(2, 1))

	err = store.Delete(inputUser.ID)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	// Deleting a non-existant user
	deleteErr := fmt.Errorf("Error executing DELETE operation")
	mock.ExpectExec(DELETESTATEMENT).
		WithArgs(-30)

	if err = store.Delete(-30); err == nil {
		t.Errorf("Expected error: %v but recieved nil", deleteErr)
	}
}
