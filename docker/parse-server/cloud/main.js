Parse.Cloud.beforeSave("Bridge", (request) => {
  // calculate bridgeIndex
  const bridgeWidth = +request.object.get("bridgeWidth");
  const bridgeHeight = +request.object.get("bridgeHeight");
  const bridgeLength = +request.object.get("bridgeLength");

  const hasBanquet = request.object.get("hasBanquet");
  const hasMinimalBanquetWidth = request.object.get("hasMinimalBanquetWidth");
  const hasStones = request.object.get("hasStones");

  const traffic = request.object.get("traffic");

  const bridgeIndex = (bridgeWidth * bridgeHeight) / bridgeLength;

  request.object.set("bridgeIndex", bridgeIndex);

  // the following calculations only take place if it is not manually overridden
  const isManualOverride = request.object.get("isManualOverride");

  if (!isManualOverride) {
    // calculate otterFriendly based on BridgeIndex
    let otterFriendly;
    // calculate risk factor based on friendliness and traffic
    let safetyRisk;

    if (
      bridgeIndex > 1.5 ||
      (bridgeIndex <= 1.5 &&
        ((hasBanquet && hasMinimalBanquetWidth) || hasStones))
    ) {
      otterFriendly = "FRIENDLY";
      safetyRisk = "NO_RISK";
    } else {
      otterFriendly = "UNFRIENDLY";
      switch (traffic) {
        case "NO_TRAFFIC":
          safetyRisk = "NO_RISK";
          break;
        case "VERY_LIGHT_TRAFFIC":
          safetyRisk = "LOW_RISK";
          break;
        case "LIGHT_TRAFFIC":
          safetyRisk = "MEDIUM_RISK";
          break;
        case "MEDIUM_TRAFFIC":
          safetyRisk = "MEDIUM_RISK";
          break;
        case "HEAVY_TRAFFIC":
          safetyRisk = "HIGH_RISK";
          break;
        case "VERY_HEAVY_TRAFFIC":
          safetyRisk = "VERY_HIGH_RISK";
          break;

        default:
          break;
      }
    }

    request.object.set("otterFriendly", otterFriendly);
    request.object.set("safetyRisk", safetyRisk);
  }
});
