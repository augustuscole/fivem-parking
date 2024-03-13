local resourceName = "es_extended"

if not GetResourceState(resourceName):find("start") then return end

local _, ESX = pcall(exports.es_extended.getSharedObject) --[[@as table | false]]

if not ESX then return end

SetVehicleProperties = ESX.Game.SetVehicleProperties
GetVehicleProperties = ESX.Game.GetVehicleProperties

local client = {}
local config = require "config"

---@return boolean
function client.hasJob()
    local job = LocalPlayer.state.job
    if not job then return false end

    for i = 1, #config.jobs do
        if job.name == config.jobs[i] then
            return true
        end
    end

    return false
end

---@param message string
---@param duration? integer
---@param position? string
---@param _type? string
---@param icon? string
function client.Notify(message, duration, position, _type, icon)
    return lib.notify({
        title = locale("notification_title"),
        description = message,
        duration = duration,
        position = position,
        type = _type,
        icon = icon,
        iconColor = config.notifications.iconColors[_type] or "#ffffff",
    })
end

---@param text string
function client.showTextUI(text)
    lib.showTextUI(text)
end

function client.hideTextUI()
    lib.hideTextUI()
end

return client
