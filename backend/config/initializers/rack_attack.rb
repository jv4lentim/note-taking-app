Rack::Attack.enabled = !Rails.env.test?

Rack::Attack.throttle("login/ip", limit: 5, period: 60) do |req|
  req.ip if req.path == "/users/sign_in" && req.post?
end

Rack::Attack.throttle("login/email", limit: 5, period: 60) do |req|
  req.params.dig("user", "email")&.downcase if req.path == "/users/sign_in" && req.post?
end

Rack::Attack.throttle("register/ip", limit: 10, period: 3600) do |req|
  req.ip if req.path == "/users" && req.post?
end

Rack::Attack.throttled_responder = lambda do |_request|
  [ 429, { "Content-Type" => "application/json" }, [ { error: "Too many requests. Try again later." }.to_json ] ]
end
