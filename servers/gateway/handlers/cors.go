package handlers

import "net/http"

/* TODO: implement a CORS middleware handler, as described
in https://drstearns.github.io/tutorials/cors/ that responds
with the following headers to all requests:

  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, PUT, POST, PATCH, DELETE
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Expose-Headers: Authorization
  Access-Control-Max-Age: 600
*/

const ALLOWORIGINHEAD = "Access-Control-Allow-Origin"
const ALLOWORIGINVAL = "*"
const METHODSHEAD = "Access-Control-Allow-Methods"
const METHODSVAL = "GET, PUT, POST, PATCH, DELETE"

// const ALLOWHEAD = "Access-Control-Allow-Headers"
// const ALLOWHEADVAL = "Content-Type, Authorization"
// const EXPOSEHEAD = "Access-Control-Expose-Headers"
// const EXPOSEHEADVAL = "Authorization"
// const MAXAGEHEAD = "Access-Control-Max-Age"
// const MAXAGEVAL = "600"

// TODO: Technique 1: Wrapping around the whole Mux
// Fill in the required field(s) and method body
type HeaderCors struct {
	Handler http.Handler
}

// return?
func (hc *HeaderCors) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set(ALLOWORIGINHEAD, ALLOWORIGINVAL) // Need to re-add in handler to avoid browser error...
		w.Header().Set(METHODSHEAD, METHODSVAL)
		// w.Header().Set(ALLOWHEAD, ALLOWHEADVAL)
		// w.Header().Set(EXPOSEHEAD, EXPOSEHEADVAL)
		// w.Header().Set(MAXAGEHEAD, MAXAGEVAL)
		w.WriteHeader(http.StatusOK)
	}
	hc.Handler.ServeHTTP(w, r)
}

func NewHeaderCors(handlerToWrap http.Handler) *HeaderCors {
	return &HeaderCors{handlerToWrap}
}
