package users

import (
	"database/sql"
	"fmt"
	"log"
	"strings"

	_ "github.com/go-sql-driver/mysql" //mysql driver
	"github.com/info441/assignments-andrewhwang10/servers/gateway/indexes"
)

//MySQLStore represents a users.Store backed by MySQL.
type MySQLStore struct {
	Client *sql.DB
}

//NewMySQLStore constructs a new MySQLStore
func NewMySQLStore(db *sql.DB) *MySQLStore {
	//initialize and return a new MySQLStore struct
	if db != nil {
		return &MySQLStore{
			Client: db,
		}
	}
	return nil
}

//Store implementation

//GetByID returns the User with the given ID
func (mss *MySQLStore) GetByID(id int64) (*User, error) {
	user := &User{}
	row := mss.Client.QueryRow("select * from users where id=?", id)
	if err := row.Scan(&user.ID, &user.Email, &user.PassHash, &user.UserName,
		&user.FirstName, &user.LastName, &user.PhotoURL); err != nil {
		return nil, err
	}
	return user, nil
}

//GetByEmail returns the User with the given email
func (mss *MySQLStore) GetByEmail(email string) (*User, error) {
	user := &User{}
	row := mss.Client.QueryRow("select * from users where email=?", email)
	if err := row.Scan(&user.ID, &user.Email, &user.PassHash, &user.UserName,
		&user.FirstName, &user.LastName, &user.PhotoURL); err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

//GetByUserName returns the User with the given Username
func (mss *MySQLStore) GetByUserName(username string) (*User, error) {
	user := &User{}
	row := mss.Client.QueryRow("select * from users where user_name=?", username)
	if err := row.Scan(&user.ID, &user.Email, &user.PassHash, &user.UserName,
		&user.FirstName, &user.LastName, &user.PhotoURL); err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

//Insert inserts the user into the database, and returns
//the newly-inserted User, complete with the DBMS-assigned ID
func (mss *MySQLStore) Insert(user *User) (*User, error) {
	insq := "insert into users(email, pass_hash, user_name, first_name, last_name, photo_url) values (?, ?, ?, ?, ?, ?)"
	res, err := mss.Client.Exec(insq, user.Email, user.PassHash, user.UserName, user.FirstName, user.LastName, user.PhotoURL)
	if err != nil {
		log.Printf("Issue executing sql statement: %v", err)
		return nil, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		log.Print("Error retrieving last insert id")
		return nil, err
	}
	user.ID = id
	return user, nil
}

//Update applies UserUpdates to the given user ID
//and returns the newly-updated user
func (mss *MySQLStore) Update(id int64, updates *Updates) (*User, error) {
	insq := "update users set first_name=?, last_name=? where id=?"
	_, err := mss.Client.Exec(insq, updates.FirstName, updates.LastName, id)
	if err != nil {
		return nil, err
	}
	return mss.GetByID(id)
}

//Delete deletes the user with the given ID
func (mss *MySQLStore) Delete(id int64) error {
	insq := "delete from users where id=?"
	_, err := mss.Client.Exec(insq, id)
	if err != nil {
		return ErrUserNotFound
	}
	return nil
}

//LoadUsers loads existing users in to trie
func (mss *MySQLStore) LoadUsers(t *indexes.Trie) error {
	rows, err := mss.Client.Query("select id, user_name, first_name, last_name, from users")
	if err != nil {
		return fmt.Errorf("error retrieving rows from sql database: %v", err)
	}
	user := User{}
	for rows.Next() {
		if err := rows.Scan(&user.ID, &user.UserName, &user.FirstName, &user.LastName); err != nil {
			t.Add(strings.ToLower(user.UserName), user.ID)
			words := strings.Split(strings.ToLower(user.FirstName), " ")
			for _, word := range words {
				t.Add(word, user.ID)
			}
			words = strings.Split(strings.ToLower(user.LastName), " ")
			for _, word := range words {
				t.Add(word, user.ID)
			}
		}
	}
	return nil
}
