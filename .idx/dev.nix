{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_22
    pkgs.docker
    pkgs.docker-compose
    pkgs.openssl
  ];
  idx.extensions = [
    
  ];
  services.docker.enable = true;
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--hostname"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}
