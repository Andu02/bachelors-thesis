export function getMethodConfig(
  hillSizeSelect,
  rsaInputs,
  adjustHillOptions,
  generateHillMatrix
) {
  return {
    caesar: {
      show: ["caesar-key-group"],
      enable: ["caesar-key"],
    },
    affine: {
      show: ["affine-options"],
      enable: ["affine-a", "affine-b"],
      clearWarning: "affine-warning",
    },
    hill: {
      show: ["hill-options"],
      custom: () => {
        adjustHillOptions();
        const size = parseInt(hillSizeSelect?.value);
        if (!isNaN(size)) generateHillMatrix(size);
      },
    },
    ecb: {
      show: ["symmetric-key-group"],
      enable: ["symmetric-key"],
    },
    cbc: {
      show: ["symmetric-key-group"],
      enable: ["symmetric-key"],
    },
    rsa: {
      show: ["rsa-options"],
      enable: Array.from(rsaInputs).map((input) => input.id),
      clearWarning: "rsa-warning",
    },
  };
}
