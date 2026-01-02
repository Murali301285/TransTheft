import { ApiEndpoint } from './api-config-types';

export const DEFAULT_APIS: ApiEndpoint[] = [
    {
        "id": "1",
        "name": "Unnamed API",
        "group": "Auth",
        "method": "POST",
        "url": "/api/Auth/login",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "2",
        "name": "Unnamed API",
        "group": "Auth",
        "method": "POST",
        "url": "/api/Auth/logOut",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "3",
        "name": "Unnamed API",
        "group": "Auth",
        "method": "POST",
        "url": "/api/Auth/refresh-token",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "4",
        "name": "Unnamed API",
        "group": "Auth",
        "method": "POST",
        "url": "/api/Auth/revoke-token",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "5",
        "name": "Unnamed API",
        "group": "Circle",
        "method": "GET",
        "url": "/api/Circle",
        "description": "",
        "isActive": true
    },
    {
        "id": "6",
        "name": "Unnamed API",
        "group": "Circle",
        "method": "GET",
        "url": "/api/Circle/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "7",
        "name": "Unnamed API",
        "group": "Circle",
        "method": "GET",
        "url": "/api/Circle/combo/{regionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "8",
        "name": "Unnamed API",
        "group": "Circle",
        "method": "GET",
        "url": "/api/Circle/{circleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "9",
        "name": "Unnamed API",
        "group": "Circle",
        "method": "PUT",
        "url": "/api/Circle/{circleId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "10",
        "name": "Unnamed API",
        "group": "Circle",
        "method": "DELETE",
        "url": "/api/Circle/{circleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "11",
        "name": "Unnamed API",
        "group": "Circle",
        "method": "POST",
        "url": "/api/Circle/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "12",
        "name": "Unnamed API",
        "group": "Circle",
        "method": "POST",
        "url": "/api/Circle/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "13",
        "name": "Unnamed API",
        "group": "Company",
        "method": "GET",
        "url": "/api/Company/get-company",
        "description": "",
        "isActive": true
    },
    {
        "id": "14",
        "name": "Unnamed API",
        "group": "Company",
        "method": "GET",
        "url": "/api/Company/get-company-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "15",
        "name": "Unnamed API",
        "group": "Company",
        "method": "GET",
        "url": "/api/Company/{companyId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "16",
        "name": "Unnamed API",
        "group": "Company",
        "method": "POST",
        "url": "/api/Company/add-company",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "17",
        "name": "Unnamed API",
        "group": "Company",
        "method": "PUT",
        "url": "/api/Company/update-company",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "18",
        "name": "Unnamed API",
        "group": "Company",
        "method": "PUT",
        "url": "/api/Company/delete-company",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "19",
        "name": "Unnamed API",
        "group": "Customer",
        "method": "GET",
        "url": "/api/Customer",
        "description": "",
        "isActive": true
    },
    {
        "id": "20",
        "name": "Unnamed API",
        "group": "Customer",
        "method": "GET",
        "url": "/api/Customer/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "21",
        "name": "Unnamed API",
        "group": "Customer",
        "method": "GET",
        "url": "/api/Customer/combo/{substationId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "22",
        "name": "Unnamed API",
        "group": "Customer",
        "method": "GET",
        "url": "/api/Customer/{customerId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "23",
        "name": "Unnamed API",
        "group": "Customer",
        "method": "PUT",
        "url": "/api/Customer/{customerId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "24",
        "name": "Unnamed API",
        "group": "Customer",
        "method": "DELETE",
        "url": "/api/Customer/{customerId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "25",
        "name": "Unnamed API",
        "group": "Customer",
        "method": "POST",
        "url": "/api/Customer/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "26",
        "name": "Unnamed API",
        "group": "Customer",
        "method": "POST",
        "url": "/api/Customer/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "27",
        "name": "Unnamed API",
        "group": "Dashboard",
        "method": "GET",
        "url": "/api/Dashboard/ht-transactions-by-company",
        "description": "",
        "isActive": true
    },
    {
        "id": "28",
        "name": "Unnamed API",
        "group": "Dashboard",
        "method": "GET",
        "url": "/api/Dashboard/ht-transactions/search",
        "description": "",
        "isActive": true
    },
    {
        "id": "29",
        "name": "Unnamed API",
        "group": "Dashboard",
        "method": "GET",
        "url": "/api/Dashboard/ht-transactions-by-user",
        "description": "",
        "isActive": true
    },
    {
        "id": "30",
        "name": "Unnamed API",
        "group": "Division",
        "method": "GET",
        "url": "/api/Division",
        "description": "",
        "isActive": true
    },
    {
        "id": "31",
        "name": "Unnamed API",
        "group": "Division",
        "method": "GET",
        "url": "/api/Division/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "32",
        "name": "Unnamed API",
        "group": "Division",
        "method": "GET",
        "url": "/api/Division/combo/{circleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "33",
        "name": "Unnamed API",
        "group": "Division",
        "method": "GET",
        "url": "/api/Division/{divisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "34",
        "name": "Unnamed API",
        "group": "Division",
        "method": "PUT",
        "url": "/api/Division/{divisionId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "35",
        "name": "Unnamed API",
        "group": "Division",
        "method": "DELETE",
        "url": "/api/Division/{divisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "36",
        "name": "Unnamed API",
        "group": "Division",
        "method": "POST",
        "url": "/api/Division/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "37",
        "name": "Unnamed API",
        "group": "Division",
        "method": "POST",
        "url": "/api/Division/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "38",
        "name": "Unnamed API",
        "group": "HWMasterCustomerMap",
        "method": "GET",
        "url": "/api/HWMasterCustomerMap/get-map",
        "description": "",
        "isActive": true
    },
    {
        "id": "39",
        "name": "Unnamed API",
        "group": "HWMasterCustomerMap",
        "method": "GET",
        "url": "/api/HWMasterCustomerMap/get-map/{mapId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "40",
        "name": "Unnamed API",
        "group": "HWMasterCustomerMap",
        "method": "GET",
        "url": "/api/HWMasterCustomerMap/get-map-by-substation/{subStationId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "41",
        "name": "Unnamed API",
        "group": "HWMasterCustomerMap",
        "method": "POST",
        "url": "/api/HWMasterCustomerMap/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "42",
        "name": "Unnamed API",
        "group": "HWMasterCustomerMap",
        "method": "POST",
        "url": "/api/HWMasterCustomerMap/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "43",
        "name": "Unnamed API",
        "group": "HWMasterCustomerMap",
        "method": "PUT",
        "url": "/api/HWMasterCustomerMap/update/{mapId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "44",
        "name": "Unnamed API",
        "group": "HWMasterCustomerMap",
        "method": "PUT",
        "url": "/api/HWMasterCustomerMap/delete/{mapId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "45",
        "name": "Unnamed API",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/get-master-devices",
        "description": "",
        "isActive": true
    },
    {
        "id": "46",
        "name": "Unnamed API",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/get-masters-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "47",
        "name": "Unnamed API",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/get-master-devices-by-subdivision/{subDivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "48",
        "name": "Unnamed API",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/get-masters-combo-by-subdivision/{subDivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "49",
        "name": "Unnamed API",
        "group": "MasterDevice",
        "method": "GET",
        "url": "/api/MasterDevice/{masterId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "50",
        "name": "Unnamed API",
        "group": "MasterDevice",
        "method": "POST",
        "url": "/api/MasterDevice/add-master-device",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "51",
        "name": "Unnamed API",
        "group": "MasterDevice",
        "method": "PUT",
        "url": "/api/MasterDevice/update-master",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "52",
        "name": "Unnamed API",
        "group": "MasterDevice",
        "method": "PUT",
        "url": "/api/MasterDevice/delete-master/{masterId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "53",
        "name": "Unnamed API",
        "group": "MasterPage",
        "method": "GET",
        "url": "/api/MasterPage/get-master-pages",
        "description": "",
        "isActive": true
    },
    {
        "id": "54",
        "name": "Unnamed API",
        "group": "MasterPage",
        "method": "GET",
        "url": "/api/MasterPage/{masterId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "55",
        "name": "Unnamed API",
        "group": "MasterPage",
        "method": "POST",
        "url": "/api/MasterPage/add-master-page",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "56",
        "name": "Unnamed API",
        "group": "MasterPage",
        "method": "PUT",
        "url": "/api/MasterPage/update-master-page",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "57",
        "name": "Unnamed API",
        "group": "MasterPage",
        "method": "PUT",
        "url": "/api/MasterPage/delete-master-page",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "58",
        "name": "Unnamed API",
        "group": "MasterPage",
        "method": "PUT",
        "url": "/api/MasterPage/delete-child-page",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "59",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-page-privileges",
        "description": "",
        "isActive": true
    },
    {
        "id": "60",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-privilegebyId/{previlegeId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "61",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-privilegebyRole/{roleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "62",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-master-privilegebyRole/{roleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "63",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "GET",
        "url": "/api/PagePrivilege/get-child-privilegebyRole",
        "description": "",
        "isActive": true
    },
    {
        "id": "64",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "POST",
        "url": "/api/PagePrivilege/add-privilege",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "65",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "POST",
        "url": "/api/PagePrivilege/add-privilege-list",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "66",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "PUT",
        "url": "/api/PagePrivilege/update-privilege",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "67",
        "name": "Unnamed API",
        "group": "PagePrivilege",
        "method": "PUT",
        "url": "/api/PagePrivilege/delete-privilege",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "68",
        "name": "Unnamed API",
        "group": "Region",
        "method": "GET",
        "url": "/api/Region",
        "description": "",
        "isActive": true
    },
    {
        "id": "69",
        "name": "Unnamed API",
        "group": "Region",
        "method": "GET",
        "url": "/api/Region/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "70",
        "name": "Unnamed API",
        "group": "Region",
        "method": "GET",
        "url": "/api/Region/{regionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "71",
        "name": "Unnamed API",
        "group": "Region",
        "method": "PUT",
        "url": "/api/Region/{regionId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "72",
        "name": "Unnamed API",
        "group": "Region",
        "method": "DELETE",
        "url": "/api/Region/{regionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "73",
        "name": "Unnamed API",
        "group": "Region",
        "method": "POST",
        "url": "/api/Region/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "74",
        "name": "Unnamed API",
        "group": "Region",
        "method": "POST",
        "url": "/api/Region/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "75",
        "name": "Unnamed API",
        "group": "SubDivision",
        "method": "GET",
        "url": "/api/SubDivision",
        "description": "",
        "isActive": true
    },
    {
        "id": "76",
        "name": "Unnamed API",
        "group": "SubDivision",
        "method": "GET",
        "url": "/api/SubDivision/combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "77",
        "name": "Unnamed API",
        "group": "SubDivision",
        "method": "GET",
        "url": "/api/SubDivision/combo/{divisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "78",
        "name": "Unnamed API",
        "group": "SubDivision",
        "method": "GET",
        "url": "/api/SubDivision/{subDivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "79",
        "name": "Unnamed API",
        "group": "SubDivision",
        "method": "PUT",
        "url": "/api/SubDivision/{subDivisionId}",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "80",
        "name": "Unnamed API",
        "group": "SubDivision",
        "method": "DELETE",
        "url": "/api/SubDivision/{subDivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "81",
        "name": "Unnamed API",
        "group": "SubDivision",
        "method": "POST",
        "url": "/api/SubDivision/create",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "82",
        "name": "Unnamed API",
        "group": "SubDivision",
        "method": "POST",
        "url": "/api/SubDivision/import",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "83",
        "name": "Unnamed API",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/get-substations",
        "description": "",
        "isActive": true
    },
    {
        "id": "84",
        "name": "Unnamed API",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/get-substations-by-subdivision/{subdivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "85",
        "name": "Unnamed API",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/get-substations-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "86",
        "name": "Unnamed API",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/get-substations-combo-by-subdivision/{subdivisionId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "87",
        "name": "Unnamed API",
        "group": "Substation",
        "method": "GET",
        "url": "/api/Substation/{substationId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "88",
        "name": "Unnamed API",
        "group": "Substation",
        "method": "POST",
        "url": "/api/Substation/add-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "89",
        "name": "Unnamed API",
        "group": "Substation",
        "method": "PUT",
        "url": "/api/Substation/update-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "90",
        "name": "Unnamed API",
        "group": "Substation",
        "method": "PUT",
        "url": "/api/Substation/delete-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "91",
        "name": "Unnamed API",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-users",
        "description": "",
        "isActive": true
    },
    {
        "id": "92",
        "name": "Unnamed API",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-roles-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "93",
        "name": "Unnamed API",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-users-combo",
        "description": "",
        "isActive": true
    },
    {
        "id": "94",
        "name": "Unnamed API",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-users-combo-by-roleId/{roleId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "95",
        "name": "Unnamed API",
        "group": "User",
        "method": "POST",
        "url": "/api/User/create-user",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "96",
        "name": "Unnamed API",
        "group": "User",
        "method": "PUT",
        "url": "/api/User/update-user",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "97",
        "name": "Unnamed API",
        "group": "User",
        "method": "PUT",
        "url": "/api/User/delete-user",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "98",
        "name": "Unnamed API",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-user-byId",
        "description": "",
        "isActive": true
    },
    {
        "id": "99",
        "name": "Unnamed API",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-user-byPhone",
        "description": "",
        "isActive": true
    },
    {
        "id": "100",
        "name": "Unnamed API",
        "group": "User",
        "method": "GET",
        "url": "/api/User/get-user-byEmail",
        "description": "",
        "isActive": true
    },
    {
        "id": "101",
        "name": "Unnamed API",
        "group": "User",
        "method": "POST",
        "url": "/api/User/change-password",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "102",
        "name": "Unnamed API",
        "group": "User",
        "method": "POST",
        "url": "/api/User/forgot-password",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "103",
        "name": "Unnamed API",
        "group": "User",
        "method": "POST",
        "url": "/api/User/reset-password",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "104",
        "name": "Unnamed API",
        "group": "UserSubstation",
        "method": "GET",
        "url": "/api/UserSubstation/get-user-substation-map",
        "description": "",
        "isActive": true
    },
    {
        "id": "105",
        "name": "Unnamed API",
        "group": "UserSubstation",
        "method": "GET",
        "url": "/api/UserSubstation/get-user-substation/{userId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "106",
        "name": "Unnamed API",
        "group": "UserSubstation",
        "method": "GET",
        "url": "/api/UserSubstation/get-substation-by-user/{userId}",
        "description": "",
        "isActive": true
    },
    {
        "id": "107",
        "name": "Unnamed API",
        "group": "UserSubstation",
        "method": "POST",
        "url": "/api/UserSubstation/add-user-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "108",
        "name": "Unnamed API",
        "group": "UserSubstation",
        "method": "POST",
        "url": "/api/UserSubstation/update-user-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "109",
        "name": "Unnamed API",
        "group": "UserSubstation",
        "method": "PUT",
        "url": "/api/UserSubstation/delete-user-substation",
        "description": "",
        "isActive": true,
        "defaultBody": "{}"
    },
    {
        "id": "110",
        "name": "Unnamed API",
        "group": "Values",
        "method": "GET",
        "url": "/api/Values",
        "description": "",
        "isActive": true
    }
];