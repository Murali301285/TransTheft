import { ApiEndpoint } from './api-config-types';

export const DEFAULT_APIS: ApiEndpoint[] = [
    {
        "id": "1",
        "name": "Auth Login",
        "group": "Auth",
        "method": "POST",
        "url": "/api/Auth/login",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "2",
        "name": "Auth LogOut",
        "group": "Auth",
        "method": "POST",
        "url": "/api/Auth/logOut",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "3",
        "name": "Auth Refresh-token",
        "group": "Auth",
        "method": "POST",
        "url": "/api/Auth/refresh-token",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "4",
        "name": "Auth Revoke-token",
        "group": "Auth",
        "method": "POST",
        "url": "/api/Auth/revoke-token",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "5",
        "name": "Circle",
        "group": "Circle",
        "method": "GET",
        "url": "/api/Circle",
        "description": "",
        "isActive": true
    },
    {
        "id": "6",
        "name": "Circle Combo",
        "group": "Circle",
        "method": "GET",
        "url": "/api/Circle/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "7",
        "name": "Circle Combo",
        "group": "Circle",
        "method": "GET",
        "url": "/api/Circle/combo/{regionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "8",
        "name": "Circle",
        "group": "Circle",
        "method": "GET",
        "url": "/api/Circle/{circleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "9",
        "name": "Circle",
        "group": "Circle",
        "method": "PUT",
        "url": "/api/Circle/{circleId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "10",
        "name": "Circle",
        "group": "Circle",
        "method": "DELETE",
        "url": "/api/Circle/{circleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "11",
        "name": "Circle Create",
        "group": "Circle",
        "method": "POST",
        "url": "/api/Circle/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "12",
        "name": "Circle Import",
        "group": "Circle",
        "method": "POST",
        "url": "/api/Circle/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "13",
        "name": "Company Get-company",
        "group": "Company",
        "method": "GET",
        "url": "/api/Company/get-company",
        "description": "",
        "isActive": true
    },
    {
        "id": "14",
        "name": "Company Get-company-combo",
        "group": "Company",
        "method": "GET",
        "url": "/api/Company/get-company-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "15",
        "name": "Company",
        "group": "Company",
        "method": "GET",
        "url": "/api/Company/{companyId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "16",
        "name": "Company Add-company",
        "group": "Company",
        "method": "POST",
        "url": "/api/Company/add-company",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "17",
        "name": "Company Update-company",
        "group": "Company",
        "method": "PUT",
        "url": "/api/Company/update-company",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "18",
        "name": "Company Delete-company",
        "group": "Company",
        "method": "PUT",
        "url": "/api/Company/delete-company",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "19",
        "name": "Customer",
        "group": "Customer",
        "method": "GET",
        "url": "/api/Customer",
        "description": "",
        "isActive": true
    },
    {
        "id": "20",
        "name": "Customer Combo",
        "group": "Customer",
        "method": "GET",
        "url": "/api/Customer/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "21",
        "name": "Customer Combo",
        "group": "Customer",
        "method": "GET",
        "url": "/api/Customer/combo/{substationId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "22",
        "name": "Customer",
        "group": "Customer",
        "method": "GET",
        "url": "/api/Customer/{customerId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "23",
        "name": "Customer",
        "group": "Customer",
        "method": "PUT",
        "url": "/api/Customer/{customerId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "24",
        "name": "Customer",
        "group": "Customer",
        "method": "DELETE",
        "url": "/api/Customer/{customerId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "25",
        "name": "Customer Create",
        "group": "Customer",
        "method": "POST",
        "url": "/api/Customer/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "26",
        "name": "Customer Import",
        "group": "Customer",
        "method": "POST",
        "url": "/api/Customer/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "27",
        "name": "Dashboard Ht-transactions-by-company",
        "group": "Dashboard",
        "method": "GET",
        "url": "/api/Dashboard/ht-transactions-by-company",
        "description": "",
        "isActive": true
    },
    {
        "id": "28",
        "name": "Dashboard Ht-transactions Search",
        "group": "Dashboard",
        "method": "GET",
        "url": "/api/Dashboard/ht-transactions/search",
        "description": "",
        "isActive": true
    },
    {
        "id": "29",
        "name": "Dashboard Ht-transactions-by-user",
        "group": "Dashboard",
        "method": "GET",
        "url": "/api/Dashboard/ht-transactions-by-user",
        "description": "",
        "isActive": true
    },
    {
        "id": "30",
        "name": "Division",
        "group": "Division",
        "method": "GET",
        "url": "/api/Division",
        "description": "",
        "isActive": true
    },
    {
        "id": "31",
        "name": "Division Combo",
        "group": "Division",
        "method": "GET",
        "url": "/api/Division/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "32",
        "name": "Division Combo",
        "group": "Division",
        "method": "GET",
        "url": "/api/Division/combo/{circleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "33",
        "name": "Division",
        "group": "Division",
        "method": "GET",
        "url": "/api/Division/{divisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "34",
        "name": "Division",
        "group": "Division",
        "method": "PUT",
        "url": "/api/Division/{divisionId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "35",
        "name": "Division",
        "group": "Division",
        "method": "DELETE",
        "url": "/api/Division/{divisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "36",
        "name": "Division Create",
        "group": "Division",
        "method": "POST",
        "url": "/api/Division/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "37",
        "name": "Division Import",
        "group": "Division",
        "method": "POST",
        "url": "/api/Division/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "38",
        "name": "HWMasterCustomerMap Get-map",
        "group": "HWMasterCustomerMap",
        "method": "GET",
        "url": "/api/HWMasterCustomerMap/get-map",
        "description": "",
        "isActive": true
    },
    {
        "id": "39",
        "name": "HWMasterCustomerMap Get-map",
        "group": "HWMasterCustomerMap",
        "method": "GET",
        "url": "/api/HWMasterCustomerMap/get-map/{mapId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "40",
        "name": "HWMasterCustomerMap Get-map-by-substation",
        "group": "HWMasterCustomerMap",
        "method": "GET",
        "url": "/api/HWMasterCustomerMap/get-map-by-substation/{subStationId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "41",
        "name": "HWMasterCustomerMap Create",
        "group": "HWMasterCustomerMap",
        "method": "POST",
        "url": "/api/HWMasterCustomerMap/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "42",
        "name": "HWMasterCustomerMap Import",
        "group": "HWMasterCustomerMap",
        "method": "POST",
        "url": "/api/HWMasterCustomerMap/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "43",
        "name": "HWMasterCustomerMap Update",
        "group": "HWMasterCustomerMap",
        "method": "PUT",
        "url": "/api/HWMasterCustomerMap/update/{mapId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "44",
        "name": "HWMasterCustomerMap Delete",
        "group": "HWMasterCustomerMap",
        "method": "PUT",
        "url": "/api/HWMasterCustomerMap/delete/{mapId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "45",
        "name": "MasterDevice Get-master-devices",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/get-master-devices",
        "description": "",
        "isActive": true
    },
    {
        "id": "46",
        "name": "MasterDevice Get-masters-combo",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/get-masters-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "47",
        "name": "MasterDevice Get-master-devices-by-subdivision",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/get-master-devices-by-subdivision/{subDivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "48",
        "name": "MasterDevice Get-masters-combo-by-subdivision",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/get-masters-combo-by-subdivision/{subDivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "49",
        "name": "MasterDevice",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/{masterId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "50",
        "name": "MasterDevice Add-master-device",
        "group": "MasterDevice",
        "method": "POST",
        "url": "/api/MasterDevice/add-master-device",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "51",
        "name": "MasterDevice Update-master",
        "group": "MasterDevice",
        "method": "PUT",
        "url": "/api/MasterDevice/update-master",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "52",
        "name": "MasterDevice Delete-master",
        "group": "MasterDevice",
        "method": "PUT",
        "url": "/api/MasterDevice/delete-master/{masterId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "53",
        "name": "MasterPage Get-master-pages",
        "group": "MasterPage",
        "method": "GET",
        "url": "/api/MasterPage/get-master-pages",
        "description": "",
        "isActive": true
    },
    {
        "id": "54",
        "name": "MasterPage",
        "group": "MasterPage",
        "method": "GET",
        "url": "/api/MasterPage/{masterId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "55",
        "name": "MasterPage Add-master-page",
        "group": "MasterPage",
        "method": "POST",
        "url": "/api/MasterPage/add-master-page",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "56",
        "name": "MasterPage Update-master-page",
        "group": "MasterPage",
        "method": "PUT",
        "url": "/api/MasterPage/update-master-page",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "57",
        "name": "MasterPage Delete-master-page",
        "group": "MasterPage",
        "method": "PUT",
        "url": "/api/MasterPage/delete-master-page",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "58",
        "name": "MasterPage Delete-child-page",
        "group": "MasterPage",
        "method": "PUT",
        "url": "/api/MasterPage/delete-child-page",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "59",
        "name": "PagePrivilege Get-page-privileges",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-page-privileges",
        "description": "",
        "isActive": true
    },
    {
        "id": "60",
        "name": "PagePrivilege Get-privilegebyId",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-privilegebyId/{previlegeId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "61",
        "name": "PagePrivilege Get-privilegebyRole",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-privilegebyRole/{roleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "62",
        "name": "PagePrivilege Get-master-privilegebyRole",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-master-privilegebyRole/{roleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "63",
        "name": "PagePrivilege Get-child-privilegebyRole",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-child-privilegebyRole",
        "description": "",
        "isActive": true
    },
    {
        "id": "64",
        "name": "PagePrivilege Add-privilege",
        "group": "PagePrivilege",
        "method": "POST",
        "url": "/api/PagePrivilege/add-privilege",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "65",
        "name": "PagePrivilege Add-privilege-list",
        "group": "PagePrivilege",
        "method": "POST",
        "url": "/api/PagePrivilege/add-privilege-list",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "66",
        "name": "PagePrivilege Update-privilege",
        "group": "PagePrivilege",
        "method": "PUT",
        "url": "/api/PagePrivilege/update-privilege",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "67",
        "name": "PagePrivilege Delete-privilege",
        "group": "PagePrivilege",
        "method": "PUT",
        "url": "/api/PagePrivilege/delete-privilege",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "68",
        "name": "Region",
        "group": "Region",
        "method": "GET",
        "url": "/api/Region",
        "description": "",
        "isActive": true
    },
    {
        "id": "69",
        "name": "Region Combo",
        "group": "Region",
        "method": "GET",
        "url": "/api/Region/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "70",
        "name": "Region",
        "group": "Region",
        "method": "GET",
        "url": "/api/Region/{regionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "71",
        "name": "Region",
        "group": "Region",
        "method": "PUT",
        "url": "/api/Region/{regionId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "72",
        "name": "Region",
        "group": "Region",
        "method": "DELETE",
        "url": "/api/Region/{regionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "73",
        "name": "Region Create",
        "group": "Region",
        "method": "POST",
        "url": "/api/Region/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "74",
        "name": "Region Import",
        "group": "Region",
        "method": "POST",
        "url": "/api/Region/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "75",
        "name": "SubDivision",
        "group": "SubDivision",
        "method": "GET",
        "url": "/api/SubDivision",
        "description": "",
        "isActive": true
    },
    {
        "id": "76",
        "name": "SubDivision Combo",
        "group": "SubDivision",
        "method": "GET",
        "url": "/api/SubDivision/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "77",
        "name": "SubDivision Combo",
        "group": "SubDivision",
        "method": "GET",
        "url": "/api/SubDivision/combo/{divisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "78",
        "name": "SubDivision",
        "group": "SubDivision",
        "method": "GET",
        "url": "/api/SubDivision/{subDivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "79",
        "name": "SubDivision",
        "group": "SubDivision",
        "method": "PUT",
        "url": "/api/SubDivision/{subDivisionId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "80",
        "name": "SubDivision",
        "group": "SubDivision",
        "method": "DELETE",
        "url": "/api/SubDivision/{subDivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "81",
        "name": "SubDivision Create",
        "group": "SubDivision",
        "method": "POST",
        "url": "/api/SubDivision/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "82",
        "name": "SubDivision Import",
        "group": "SubDivision",
        "method": "POST",
        "url": "/api/SubDivision/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "83",
        "name": "Substation Get-substations",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/get-substations",
        "description": "",
        "isActive": true
    },
    {
        "id": "84",
        "name": "Substation Get-substations-by-subdivision",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/get-substations-by-subdivision/{subdivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "85",
        "name": "Substation Get-substations-combo",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/get-substations-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "86",
        "name": "Substation Get-substations-combo-by-subdivision",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/get-substations-combo-by-subdivision/{subdivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "87",
        "name": "Substation",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/{substationId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "88",
        "name": "Substation Add-substation",
        "group": "Substation",
        "method": "POST",
        "url": "/api/Substation/add-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "89",
        "name": "Substation Update-substation",
        "group": "Substation",
        "method": "PUT",
        "url": "/api/Substation/update-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "90",
        "name": "Substation Delete-substation",
        "group": "Substation",
        "method": "PUT",
        "url": "/api/Substation/delete-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "91",
        "name": "User Get-users",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-users",
        "description": "",
        "isActive": true
    },
    {
        "id": "92",
        "name": "User Get-roles-combo",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-roles-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "93",
        "name": "User Get-users-combo",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-users-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "94",
        "name": "User Get-users-combo-by-roleId",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-users-combo-by-roleId/{roleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "95",
        "name": "User Create-user",
        "group": "User",
        "method": "POST",
        "url": "/api/User/create-user",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "96",
        "name": "User Update-user",
        "group": "User",
        "method": "PUT",
        "url": "/api/User/update-user",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "97",
        "name": "User Delete-user",
        "group": "User",
        "method": "PUT",
        "url": "/api/User/delete-user",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "98",
        "name": "User Get-user-byId",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-user-byId",
        "description": "",
        "isActive": true
    },
    {
        "id": "99",
        "name": "User Get-user-byPhone",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-user-byPhone",
        "description": "",
        "isActive": true
    },
    {
        "id": "100",
        "name": "User Get-user-byEmail",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-user-byEmail",
        "description": "",
        "isActive": true
    },
    {
        "id": "101",
        "name": "User Change-password",
        "group": "User",
        "method": "POST",
        "url": "/api/User/change-password",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "102",
        "name": "User Forgot-password",
        "group": "User",
        "method": "POST",
        "url": "/api/User/forgot-password",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "103",
        "name": "User Reset-password",
        "group": "User",
        "method": "POST",
        "url": "/api/User/reset-password",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "104",
        "name": "UserSubstation Get-user-substation-map",
        "group": "UserSubstation",
        "method": "GET",
        "url": "/api/UserSubstation/get-user-substation-map",
        "description": "",
        "isActive": true
    },
    {
        "id": "105",
        "name": "UserSubstation Get-user-substation",
        "group": "UserSubstation",
        "method": "GET",
        "url": "/api/UserSubstation/get-user-substation/{userId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "106",
        "name": "UserSubstation Get-substation-by-user",
        "group": "UserSubstation",
        "method": "GET",
        "url": "/api/UserSubstation/get-substation-by-user/{userId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "107",
        "name": "UserSubstation Add-user-substation",
        "group": "UserSubstation",
        "method": "POST",
        "url": "/api/UserSubstation/add-user-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "108",
        "name": "UserSubstation Update-user-substation",
        "group": "UserSubstation",
        "method": "POST",
        "url": "/api/UserSubstation/update-user-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "109",
        "name": "UserSubstation Delete-user-substation",
        "group": "UserSubstation",
        "method": "PUT",
        "url": "/api/UserSubstation/delete-user-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "110",
        "name": "Values",
        "group": "Values",
        "method": "GET",
        "url": "/api/Values",
        "description": "",
        "isActive": true
    }
];