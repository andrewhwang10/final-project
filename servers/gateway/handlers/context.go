package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"net/url"

	"github.com/info441/assignments-andrewhwang10/servers/gateway/models/users"
	"github.com/info441/assignments-andrewhwang10/servers/gateway/sessions"
)

//HandlerContext represents a receiver for handlers to utilize and gain context
type HandlerContext struct {
	SigningKey   string         `json:"signingKey,omitempty"`
	SessionStore sessions.Store `json:"sessionStore,omitempty"`
	UserStore    users.Store    `json:"userStore,omitempty"`
}

func (ctx *HandlerContext) CustomDirector(targets []*url.URL) func(*http.Request) {
	return func(r *http.Request) {
		targ := targets[rand.Int()%len(targets)]
		sessState := SessionState{}
		_, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, sessState)
		if err == nil {
			obj, err := json.Marshal(sessState.User)
			if err == nil {
				r.Header.Del("X-User")
				r.Header.Add("X-User", string(obj))
			}
		}
		r.Host = targ.Host
		r.URL.Host = targ.Host
		r.URL.Scheme = targ.Scheme
	}
}
