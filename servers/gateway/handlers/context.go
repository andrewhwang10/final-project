package handlers

import (
	"encoding/json"
	"final-project/servers/gateway/models/sessions"
	"final-project/servers/gateway/models/users"
	"fmt"
	"net/http"
	"net/url"
)

//HandlerContext represents a receiver for handlers to utilize and gain context
type HandlerContext struct {
	SigningKey   string         `json:"signingKey,omitempty"`
	SessionStore sessions.Store `json:"sessionStore,omitempty"`
	UserStore    users.Store    `json:"userStore,omitempty"`
}

type Director func(r *http.Request)

func (ctx *HandlerContext) CustomDirector(targ *url.URL) Director {
	fmt.Printf("INSIDE CUSTOM DIRECTOR\n")
	return func(r *http.Request) {
		r.Host = targ.Host
		r.URL.Host = targ.Host
		r.URL.Scheme = targ.Scheme

		sessState := &SessionState{}
		_, errState := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, sessState)
		if errState != nil {
			fmt.Printf("error in getState: %v\n", errState)
			r.Header.Del("X-User")
			return
		}
		authUser := sessState.User
		authUserByte, _ := json.Marshal(authUser)

		r.Header.Add("X-User", string(authUserByte))
	}
}
