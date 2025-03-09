{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        formatter = pkgs.nixfmt-rfc-style;
      in
      {
        inherit formatter;

        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              formatter

              nodejs_23

              zizmor
              actionlint
            ];
          };
        };
      }
    );
}
