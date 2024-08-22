---@class Vehicle
---@field owner number
---@field model number | string This is supposed to be only a number, but this: `adder` is seen as a string
---@field modelName? string
---@field plate? string
---@field props table
---@field type? 'car' | 'van' | 'truck' | 'bicycle' | 'motorcycle' | 'boat' | 'helicopter' | 'plane' | 'train' | 'emergency'
---@field location 'outside' | 'parked' | 'impound'
---@field fuel number
---@field body number
---@field engine number
---@field temporary? boolean

---@class VehicleDatabase
---@field owner string
---@field plate string
---@field model integer
---@field props string
---@field type 'car' | 'van' | 'truck' | 'bicycle' | 'motorcycle' | 'boat' | 'helicopter' | 'plane' | 'train' | 'emergency'
---@field location 'outside' | 'parked' | 'impound'
---@field fuel number
---@field body number
---@field engine number
